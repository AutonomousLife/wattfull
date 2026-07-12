import "./styles.css";
import { template } from "./ui/template";
import { UI } from "./ui/UI";
import { Game } from "./game/Game";
import { deleteWorld, loadSave, loadSettings, saveSettings } from "./persistence/db";
import { seedFrom } from "./world/noise";

document.querySelector<HTMLDivElement>('#app')!.innerHTML=template;
const settings=await loadSettings();
const ui=new UI(settings);
let save=await loadSave();
let game:Game|undefined;
ui.setContinue(!!save);
ui.onSettings=()=>{void saveSettings(settings);game?.refreshSettings();};

async function launch(name:string,seed:number,existing=save??undefined){
  game?.stop();game=new Game(name,seed,settings,ui,existing);await game.start();await game.save();
}
ui.onContinue=()=>{if(save)void launch(save.name,save.seed,save);};
ui.onNewWorld=(name,seedText)=>{const seed=seedFrom(seedText.trim()||'worksite');save=null;ui.setContinue(false);void launch(name,seed);};
document.querySelector<HTMLButtonElement>('#delete-world')!.onclick=async()=>{if(!confirm('Delete the saved Blockworks world? This cannot be undone.'))return;await deleteWorld();save=null;ui.setContinue(false);ui.message('Saved world deleted');};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game)void game.save();});
addEventListener('beforeunload',()=>{if(game)void game.save();});
ui.showTitle();
