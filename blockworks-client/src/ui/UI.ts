import type { Settings } from "../shared/types";
import type { Inventory } from "../inventory/Inventory";
import { BlockId, ITEM_NAMES, ItemId, isTool } from "../world/blocks";
import { RECIPES, canCraft } from "../crafting/recipes";
import { OBJECTIVES } from "../game/objectives";
import { TOWER_REPAIR } from "../game/repair";

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;

export class UI {
  onNewWorld: (name: string, seed: string) => void = () => {};
  onContinue: () => void = () => {};
  onResume: () => void = () => {};
  onSave: () => void = () => {};
  onQuit: () => void = () => {};
  onCraft: (id: string) => void = () => {};
  onMoveSlot: (from: number, to: number) => void = () => {};
  onSettings: () => void = () => {};
  private active = 'title';
  private previous = 'title';
  private messageTimer = 0;
  private moving: number | null = null;

  constructor(public settings: Settings) {
    $('#new-world').onclick = () => this.open('new-dialog');
    $('#continue').onclick = () => this.onContinue();
    $('#resume').onclick = () => this.onResume();
    $('#save').onclick = () => this.onSave();
    $('#quit').onclick = () => this.onQuit();
    document.querySelectorAll<HTMLElement>('[data-open]').forEach(button => button.onclick = () => this.open(button.dataset.open!));
    document.querySelectorAll<HTMLElement>('[data-close]').forEach(button => button.onclick = () => this.closeOverlay());
    $('form').onsubmit = event => {
      event.preventDefault();
      this.onNewWorld($<HTMLInputElement>('#world-name').value || 'Worksite', $<HTMLInputElement>('#world-seed').value);
    };
    this.bindSetting('render-distance', 'renderDistance', Number);
    this.bindSetting('fov', 'fov', Number);
    this.bindSetting('sensitivity', 'sensitivity', value => Number(value) * .001);
    this.bindSetting('volume', 'volume', Number);
    this.bindCheck('head-bob', 'headBob');
    this.bindCheck('objectives', 'objectives');
    this.syncSettings();
  }

  private bindSetting(id: string, key: keyof Settings, parse: (value: string) => number) {
    const element = $<HTMLInputElement>(`#${id}`);
    element.oninput = () => {
      (this.settings[key] as number) = parse(element.value);
      this.syncSettings();
      this.onSettings();
    };
  }
  private bindCheck(id: string, key: keyof Settings) {
    const element = $<HTMLInputElement>(`#${id}`);
    element.onchange = () => {
      (this.settings[key] as boolean) = element.checked;
      this.syncSettings();
      this.onSettings();
    };
  }
  syncSettings() {
    const settings = this.settings;
    $<HTMLInputElement>('#render-distance').value = String(settings.renderDistance);
    $<HTMLInputElement>('#fov').value = String(settings.fov);
    $<HTMLInputElement>('#sensitivity').value = String(settings.sensitivity * 1000);
    $<HTMLInputElement>('#volume').value = String(settings.volume);
    $<HTMLInputElement>('#head-bob').checked = settings.headBob;
    $<HTMLInputElement>('#objectives').checked = settings.objectives;
    $('#render-out').textContent = String(settings.renderDistance);
    $('#fov-out').textContent = String(settings.fov);
    $('#objective').style.display = settings.objectives ? 'block' : 'none';
  }
  setContinue(enabled: boolean) { $<HTMLButtonElement>('#continue').disabled = !enabled; $('#delete-world').hidden = !enabled; }
  showTitle() { this.hideAll(); this.open('title'); $('#hud').hidden = true; }
  showGame() { this.hideAll(); $('#hud').hidden = false; this.active = 'game'; }
  pause() { this.open('pause'); }
  inventory(inventory: Inventory, nearBench: boolean) { this.renderInventory(inventory, nearBench); this.open('inventory'); }
  closeOverlay() {
    if (['settings', 'controls', 'new-dialog'].includes(this.active)) {
      this.open(this.previous === 'pause' ? 'pause' : 'title');
      return;
    }
    this.onResume();
  }
  open(id: string) { if (id !== this.active) this.previous = this.active; this.hideAll(); $(`#${id}`).classList.add('active'); this.active = id; }
  hideAll() { document.querySelectorAll('.screen').forEach(element => element.classList.remove('active')); }
  isMenu() { return this.active !== 'game'; }

  renderHUD(inventory: Inventory, health: number, objective: number, completed: boolean) {
    $('#health').textContent = `HEALTH ${health}/20`;
    const objectiveElement = $('#objective');
    objectiveElement.style.display = completed || !this.settings.objectives ? 'none' : 'block';
    let text = OBJECTIVES[objective] ?? '';
    if (objective === 5) text = `Mine voltaic crystal · ${Math.min(3, inventory.count(ItemId.Crystal))}/3`;
    if (objective === 7) {
      const core = inventory.count(BlockId.Beacon) ? 'core ready' : 'core missing';
      text = `Repair tower · ${inventory.count(BlockId.Planks)}/${TOWER_REPAIR.planks} planks · ${inventory.count(BlockId.Cobblestone)}/${TOWER_REPAIR.cobblestone} stone · ${core}`;
    }
    $('#objective-text').textContent = text;
    const bar = $('#hotbar');
    bar.innerHTML = '';
    for (let index = 0; index < 9; index++) bar.append(this.slot(inventory, index, index === inventory.selected, false));
    this.viewmodel(inventory.slots[inventory.selected]?.id ?? 0, false);
  }

  viewmodel(id: number, swinging: boolean) {
    const element = $('#viewmodel');
    element.className = id ? `tool${isTool(id) ? '' : ' hand'}${swinging ? ' swing' : ''}` : '';
  }

  renderInventory(inventory: Inventory, nearBench: boolean) {
    const grid = $('#inventory-grid');
    grid.innerHTML = '';
    inventory.slots.forEach((_, index) => {
      const element = this.slot(inventory, index, false, true);
      element.onclick = () => {
        if (this.moving === null) { this.moving = index; element.classList.add('selected'); }
        else { this.onMoveSlot(this.moving, index); this.moving = null; this.renderInventory(inventory, nearBench); }
      };
      grid.append(element);
    });
    const recipes = $('#recipes');
    recipes.innerHTML = '';
    for (const recipe of RECIPES) {
      const button = document.createElement('button');
      button.className = 'recipe';
      button.disabled = !canCraft(inventory, recipe, nearBench);
      const requirements = recipe.ingredients.map(item => `${inventory.count(item.id)}/${item.count} ${ITEM_NAMES[item.id]}`).join(' · ');
      button.innerHTML = `<b>${recipe.name}</b><span>×${recipe.output.count}</span><small>${requirements}${recipe.bench ? ' · bench' : ''}</small>`;
      button.onclick = () => this.onCraft(recipe.id);
      recipes.append(button);
    }
  }

  private slot(inventory: Inventory, index: number, selected = false, labelled = false) {
    const button = document.createElement('button');
    const stack = inventory.slots[index];
    button.className = `slot${selected ? ' selected' : ''}`;
    if (stack) {
      const name = ITEM_NAMES[stack.id] ?? 'Unknown item';
      button.setAttribute('aria-label', `${name}${stack.count > 1 ? ` ${stack.count}` : ''}`);
      const icon = stack.id < 16
        ? `<i class="item-icon" style="background-position:${(stack.id % 4) * 100 / 3}% ${Math.floor(stack.id / 4) * 100 / 3}%"></i>`
        : `<b class="item-mark">${stack.id === ItemId.WoodPickaxe || stack.id === ItemId.StonePickaxe ? 'PICK' : stack.id === ItemId.Crystal ? 'CORE' : name.slice(0, 4).toUpperCase()}</b>`;
      button.innerHTML = `${icon}<span class="count">${stack.count > 1 ? stack.count : ''}</span>${isTool(stack.id) ? `<span class="durability"><i style="width:${Math.max(0, (stack.durability ?? 0) / (stack.id === ItemId.WoodPickaxe ? 45 : 110) * 100)}%"></i></span>` : ''}`;
      if (labelled) button.dataset.item = name;
    } else button.setAttribute('aria-label', `Empty slot ${index + 1}`);
    return button;
  }
  mining(progress: number) { const element = $('#mine-progress'); element.style.opacity = progress > 0 ? '1' : '0'; element.querySelector<HTMLElement>('i')!.style.width = `${Math.min(100, progress * 100)}%`; }
  message(text: string) { const element = $('#message'); element.textContent = text; element.style.opacity = '1'; clearTimeout(this.messageTimer); this.messageTimer = window.setTimeout(() => element.style.opacity = '0', 1400); }
  reject() { const crosshair = $('#crosshair'); crosshair.classList.add('reject'); setTimeout(() => crosshair.classList.remove('reject'), 120); }
  damage() { const element = $('#damage'); element.classList.add('flash'); setTimeout(() => element.classList.remove('flash'), 100); }
  debug(text: string, show: boolean) { const element = $('#debug'); element.hidden = !show; element.textContent = text; }
}
