"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line } from "recharts";

// ─── THEME ENGINE ───
const themes = {
  light: {
    bg:"#FAFAF8",bg2:"#F4F3F0",white:"#FFFFFF",card:"#F6F5F2",
    text:"#1E1E1E",textMid:"#4A4A4A",textLight:"#7A7A7A",textFaint:"#A8A8A8",
    green:"#4A7C59",greenLight:"#E6EFE9",greenDark:"#2F5A3C",
    border:"#E5E3DE",borderLight:"#EEEDEA",
    warn:"#C97B2A",warnBg:"#FFF8EF",err:"#B5403A",errBg:"#FFF0EF",
    blue:"#4A6FA5",blueBg:"#EEF3FA",
    star:"#D4A017",navBg:"rgba(250,250,248,.95)",
    cardHover:"#F0EFEC",shadow:"rgba(0,0,0,.06)",
  },
  dark: {
    bg:"#111113",bg2:"#1A1A1E",white:"#1E1E22",card:"#232328",
    text:"#E8E8EC",textMid:"#A0A0A8",textLight:"#6E6E78",textFaint:"#4A4A52",
    green:"#6AAF7B",greenLight:"#1A2E20",greenDark:"#8CD49A",
    border:"#2A2A30",borderLight:"#222228",
    warn:"#E0993A",warnBg:"#2A2218",err:"#E06060",errBg:"#2A1A1A",
    blue:"#6A9FD5",blueBg:"#1A2230",
    star:"#E8B830",navBg:"rgba(17,17,19,.92)",
    cardHover:"#2A2A30",shadow:"rgba(0,0,0,.3)",
  }
};

// ─── ZIP → STATE ───
const ZM={"010":"MA","011":"MA","012":"MA","013":"MA","014":"MA","015":"MA","016":"MA","017":"MA","018":"MA","019":"MA","020":"MA","021":"MA","022":"MA","023":"MA","024":"MA","025":"MA","026":"MA","027":"MA","028":"RI","029":"RI","030":"NH","031":"NH","032":"NH","033":"NH","034":"NH","035":"VT","036":"VT","037":"VT","038":"VT","039":"ME","040":"ME","041":"ME","042":"ME","043":"ME","044":"ME","045":"ME","046":"ME","047":"ME","048":"ME","049":"ME","050":"VT","051":"VT","052":"VT","053":"VT","054":"VT","055":"MA","056":"VT","057":"VT","058":"VT","059":"VT","060":"CT","061":"CT","062":"CT","063":"CT","064":"CT","065":"CT","066":"CT","067":"CT","068":"CT","069":"CT","070":"NJ","071":"NJ","072":"NJ","073":"NJ","074":"NJ","075":"NJ","076":"NJ","077":"NJ","078":"NJ","079":"NJ","080":"NJ","081":"NJ","082":"NJ","083":"NJ","084":"NJ","085":"NJ","086":"NJ","087":"NJ","088":"NJ","089":"NJ","100":"NY","101":"NY","102":"NY","103":"NY","104":"NY","105":"NY","106":"NY","107":"NY","108":"NY","109":"NY","110":"NY","111":"NY","112":"NY","113":"NY","114":"NY","115":"NY","116":"NY","117":"NY","118":"NY","119":"NY","120":"NY","121":"NY","122":"NY","123":"NY","124":"NY","125":"NY","126":"NY","127":"NY","128":"NY","129":"NY","130":"NY","131":"NY","132":"NY","133":"NY","134":"NY","135":"NY","136":"NY","137":"NY","138":"NY","139":"NY","140":"NY","141":"NY","142":"NY","143":"NY","144":"NY","145":"NY","146":"NY","147":"NY","148":"NY","149":"NY","150":"PA","151":"PA","152":"PA","153":"PA","154":"PA","155":"PA","156":"PA","157":"PA","158":"PA","159":"PA","160":"PA","161":"PA","162":"PA","163":"PA","164":"PA","165":"PA","166":"PA","167":"PA","168":"PA","169":"PA","170":"PA","171":"PA","172":"PA","173":"PA","174":"PA","175":"PA","176":"PA","177":"PA","178":"PA","179":"PA","180":"PA","181":"PA","182":"PA","183":"PA","184":"PA","185":"PA","186":"PA","187":"PA","188":"PA","189":"PA","190":"PA","191":"PA","192":"PA","193":"PA","194":"PA","195":"PA","196":"PA","197":"DE","198":"DE","199":"DE","200":"VA","201":"VA","202":"DC","203":"DC","204":"DC","206":"MD","207":"MD","208":"MD","209":"MD","210":"MD","211":"MD","212":"MD","214":"MD","215":"MD","216":"MD","220":"VA","221":"VA","222":"VA","223":"VA","224":"VA","225":"VA","226":"VA","227":"VA","228":"VA","229":"VA","230":"VA","231":"VA","232":"VA","233":"VA","234":"VA","235":"VA","236":"VA","237":"VA","238":"VA","239":"VA","240":"VA","241":"VA","242":"VA","243":"VA","244":"VA","245":"VA","246":"VA","247":"WV","248":"WV","249":"WV","250":"WV","251":"WV","252":"WV","253":"WV","254":"WV","255":"WV","256":"WV","257":"WV","258":"WV","259":"WV","260":"WV","261":"WV","262":"WV","263":"WV","264":"WV","265":"WV","266":"WV","267":"WV","268":"WV","270":"NC","271":"NC","272":"NC","273":"NC","274":"NC","275":"NC","276":"NC","277":"NC","278":"NC","279":"NC","280":"NC","281":"NC","282":"NC","283":"NC","284":"NC","285":"NC","286":"NC","287":"NC","288":"NC","289":"NC","290":"SC","291":"SC","292":"SC","293":"SC","294":"SC","295":"SC","296":"SC","297":"SC","298":"SC","299":"SC","300":"GA","301":"GA","302":"GA","303":"GA","304":"GA","305":"GA","306":"GA","307":"GA","308":"GA","309":"GA","310":"GA","311":"GA","312":"GA","313":"GA","314":"GA","315":"GA","316":"GA","317":"GA","318":"GA","319":"GA","320":"FL","321":"FL","322":"FL","323":"FL","324":"FL","325":"FL","326":"FL","327":"FL","328":"FL","329":"FL","330":"FL","331":"FL","332":"FL","333":"FL","334":"FL","335":"FL","336":"FL","337":"FL","338":"FL","339":"FL","340":"FL","341":"FL","342":"FL","344":"FL","346":"FL","347":"FL","349":"FL","350":"AL","351":"AL","352":"AL","354":"AL","355":"AL","356":"AL","357":"AL","358":"AL","359":"AL","360":"AL","361":"AL","362":"AL","363":"AL","364":"AL","365":"AL","366":"AL","367":"AL","368":"AL","369":"AL","370":"TN","371":"TN","372":"TN","373":"TN","374":"TN","375":"TN","376":"TN","377":"TN","378":"TN","379":"TN","380":"TN","381":"TN","382":"TN","383":"TN","384":"TN","385":"TN","386":"MS","387":"MS","388":"MS","389":"MS","390":"MS","391":"MS","392":"MS","393":"MS","394":"MS","395":"MS","396":"MS","397":"MS","400":"KY","401":"KY","402":"KY","403":"KY","404":"KY","405":"KY","406":"KY","407":"KY","408":"KY","409":"KY","410":"KY","411":"KY","412":"KY","413":"KY","414":"KY","415":"KY","416":"KY","417":"KY","418":"KY","420":"KY","421":"KY","422":"KY","423":"KY","424":"KY","425":"KY","426":"KY","427":"KY","430":"OH","431":"OH","432":"OH","433":"OH","434":"OH","435":"OH","436":"OH","437":"OH","438":"OH","439":"OH","440":"OH","441":"OH","442":"OH","443":"OH","444":"OH","445":"OH","446":"OH","447":"OH","448":"OH","449":"OH","450":"OH","451":"OH","452":"OH","453":"OH","454":"OH","455":"OH","456":"OH","457":"OH","458":"OH","459":"OH","460":"IN","461":"IN","462":"IN","463":"IN","464":"IN","465":"IN","466":"IN","467":"IN","468":"IN","469":"IN","470":"IN","471":"IN","472":"IN","473":"IN","474":"IN","475":"IN","476":"IN","477":"IN","478":"IN","479":"IN","480":"MI","481":"MI","482":"MI","483":"MI","484":"MI","485":"MI","486":"MI","487":"MI","488":"MI","489":"MI","490":"MI","491":"MI","492":"MI","493":"MI","494":"MI","495":"MI","496":"MI","497":"MI","498":"MI","499":"MI","500":"IA","501":"IA","502":"IA","503":"IA","504":"IA","505":"IA","506":"IA","507":"IA","508":"IA","509":"IA","510":"IA","511":"IA","512":"IA","513":"IA","514":"IA","515":"IA","516":"IA","520":"IA","521":"IA","522":"IA","523":"IA","524":"IA","525":"IA","526":"IA","527":"IA","528":"IA","530":"WI","531":"WI","532":"WI","534":"WI","535":"WI","537":"WI","538":"WI","539":"WI","540":"WI","541":"WI","542":"WI","543":"WI","544":"WI","545":"WI","546":"WI","547":"WI","548":"WI","549":"WI","550":"MN","551":"MN","553":"MN","554":"MN","555":"MN","556":"MN","557":"MN","558":"MN","559":"MN","560":"MN","561":"MN","562":"MN","563":"MN","564":"MN","565":"MN","566":"MN","567":"MN","570":"SD","571":"SD","572":"SD","573":"SD","574":"SD","575":"SD","576":"SD","577":"SD","580":"ND","581":"ND","582":"ND","583":"ND","584":"ND","585":"ND","586":"ND","587":"ND","588":"ND","590":"MT","591":"MT","592":"MT","593":"MT","594":"MT","595":"MT","596":"MT","597":"MT","598":"MT","599":"MT","600":"IL","601":"IL","602":"IL","603":"IL","604":"IL","605":"IL","606":"IL","607":"IL","608":"IL","609":"IL","610":"IL","611":"IL","612":"IL","613":"IL","614":"IL","615":"IL","616":"IL","617":"IL","618":"IL","619":"IL","620":"IL","622":"IL","623":"IL","624":"IL","625":"IL","626":"IL","627":"IL","628":"IL","629":"IL","630":"MO","631":"MO","633":"MO","634":"MO","635":"MO","636":"MO","637":"MO","638":"MO","639":"MO","640":"MO","641":"MO","644":"MO","645":"MO","646":"MO","647":"MO","648":"MO","649":"MO","650":"MO","651":"MO","652":"MO","653":"MO","654":"MO","655":"MO","656":"MO","657":"MO","658":"MO","660":"KS","661":"KS","662":"KS","664":"KS","665":"KS","666":"KS","667":"KS","668":"KS","669":"KS","670":"KS","671":"KS","672":"KS","673":"KS","674":"KS","675":"KS","676":"KS","677":"KS","678":"KS","679":"KS","680":"NE","681":"NE","683":"NE","684":"NE","685":"NE","686":"NE","687":"NE","688":"NE","689":"NE","690":"NE","691":"NE","692":"NE","693":"NE","700":"LA","701":"LA","703":"LA","704":"LA","705":"LA","706":"LA","707":"LA","708":"LA","710":"LA","711":"LA","712":"LA","713":"LA","714":"LA","716":"AR","717":"AR","718":"AR","719":"AR","720":"AR","721":"AR","722":"AR","723":"AR","724":"AR","725":"AR","726":"AR","727":"AR","728":"AR","729":"AR","730":"OK","731":"OK","734":"OK","735":"OK","736":"OK","737":"OK","738":"OK","739":"OK","740":"OK","741":"OK","743":"OK","744":"OK","745":"OK","746":"OK","747":"OK","748":"OK","749":"OK","750":"TX","751":"TX","752":"TX","753":"TX","754":"TX","755":"TX","756":"TX","757":"TX","758":"TX","759":"TX","760":"TX","761":"TX","762":"TX","763":"TX","764":"TX","765":"TX","766":"TX","767":"TX","768":"TX","769":"TX","770":"TX","771":"TX","772":"TX","773":"TX","774":"TX","775":"TX","776":"TX","777":"TX","778":"TX","779":"TX","780":"TX","781":"TX","782":"TX","783":"TX","784":"TX","785":"TX","786":"TX","787":"TX","788":"TX","789":"TX","790":"TX","791":"TX","792":"TX","793":"TX","794":"TX","795":"TX","796":"TX","797":"TX","798":"TX","799":"TX","800":"CO","801":"CO","802":"CO","803":"CO","804":"CO","805":"CO","806":"CO","807":"CO","808":"CO","809":"CO","810":"CO","811":"CO","812":"CO","813":"CO","814":"CO","815":"CO","816":"CO","820":"WY","821":"WY","822":"WY","823":"WY","824":"WY","825":"WY","826":"WY","827":"WY","828":"WY","829":"WY","830":"WY","831":"WY","832":"ID","833":"ID","834":"ID","835":"ID","836":"ID","837":"ID","838":"ID","840":"UT","841":"UT","842":"UT","843":"UT","844":"UT","845":"UT","846":"UT","847":"UT","850":"AZ","851":"AZ","852":"AZ","853":"AZ","855":"AZ","856":"AZ","857":"AZ","859":"AZ","860":"AZ","863":"AZ","864":"AZ","865":"AZ","870":"NM","871":"NM","872":"NM","873":"NM","874":"NM","875":"NM","877":"NM","878":"NM","879":"NM","880":"TX","881":"TX","882":"TX","883":"TX","884":"TX","885":"TX","890":"NV","891":"NV","893":"NV","894":"NV","895":"NV","897":"NV","898":"NV","900":"CA","901":"CA","902":"CA","903":"CA","904":"CA","905":"CA","906":"CA","907":"CA","908":"CA","910":"CA","911":"CA","912":"CA","913":"CA","914":"CA","915":"CA","916":"CA","917":"CA","918":"CA","919":"CA","920":"CA","921":"CA","922":"CA","923":"CA","924":"CA","925":"CA","926":"CA","927":"CA","928":"CA","930":"CA","931":"CA","932":"CA","933":"CA","934":"CA","935":"CA","936":"CA","937":"CA","938":"CA","939":"CA","940":"CA","941":"CA","942":"CA","943":"CA","944":"CA","945":"CA","946":"CA","947":"CA","948":"CA","949":"CA","950":"CA","951":"CA","952":"CA","953":"CA","954":"CA","955":"CA","956":"CA","957":"CA","958":"CA","959":"CA","960":"CA","961":"CA","970":"OR","971":"OR","972":"OR","973":"OR","974":"OR","975":"OR","976":"OR","977":"OR","978":"OR","979":"OR","980":"WA","981":"WA","982":"WA","983":"WA","984":"WA","985":"WA","986":"WA","988":"WA","989":"WA","990":"WA","991":"WA","992":"WA","993":"WA","994":"WA","995":"AK","996":"AK","997":"AK","998":"AK","999":"AK"};
function zipToState(z){return ZM[z?.substring(0,3)]||null}

const SD={AL:{e:13.86,g:2.89,s:4.8,z:"hot",ec:0,sc:0,nm:"partial",gc:28},AK:{e:24.21,g:3.82,s:2.8,z:"cold",ec:0,sc:0,nm:"none",gc:35},AZ:{e:13.62,g:3.32,s:6.4,z:"hot",ec:0,sc:1000,nm:"partial",gc:38},AR:{e:12.45,g:2.78,s:4.9,z:"warm",ec:0,sc:0,nm:"full",gc:30},CA:{e:27.28,g:4.85,s:5.8,z:"mild",ec:2000,sc:0,nm:"full",gc:52},CO:{e:14.79,g:3.15,s:5.6,z:"cold",ec:2500,sc:0,nm:"full",gc:40},CT:{e:25.63,g:3.25,s:4.2,z:"cold",ec:2250,sc:0,nm:"full",gc:45},DE:{e:14.08,g:3.05,s:4.5,z:"mild",ec:0,sc:0,nm:"full",gc:32},FL:{e:14.17,g:3.18,s:5.5,z:"hot",ec:0,sc:0,nm:"full",gc:30},GA:{e:13.45,g:2.95,s:5.0,z:"hot",ec:0,sc:0,nm:"partial",gc:28},HI:{e:43.18,g:4.65,s:5.5,z:"hot",ec:0,sc:0,nm:"full",gc:35},ID:{e:10.92,g:3.35,s:5.0,z:"cold",ec:0,sc:0,nm:"full",gc:65},IL:{e:15.24,g:3.45,s:4.3,z:"cold",ec:4000,sc:0,nm:"full",gc:38},IN:{e:14.52,g:3.15,s:4.2,z:"cold",ec:0,sc:0,nm:"full",gc:22},IA:{e:14.46,g:3.05,s:4.4,z:"cold",ec:0,sc:0,nm:"full",gc:60},KS:{e:14.11,g:2.85,s:5.0,z:"warm",ec:0,sc:0,nm:"partial",gc:42},KY:{e:12.56,g:2.92,s:4.3,z:"warm",ec:0,sc:0,nm:"none",gc:15},LA:{e:12.09,g:2.82,s:5.0,z:"hot",ec:2500,sc:0,nm:"full",gc:18},ME:{e:21.72,g:3.28,s:4.0,z:"cold",ec:2000,sc:0,nm:"full",gc:72},MD:{e:15.82,g:3.18,s:4.5,z:"mild",ec:3000,sc:0,nm:"full",gc:35},MA:{e:25.46,g:3.22,s:4.2,z:"cold",ec:3500,sc:1000,nm:"full",gc:48},MI:{e:18.35,g:3.15,s:3.8,z:"cold",ec:0,sc:0,nm:"partial",gc:28},MN:{e:14.48,g:3.05,s:4.2,z:"cold",ec:0,sc:0,nm:"full",gc:38},MS:{e:13.12,g:2.75,s:4.8,z:"hot",ec:0,sc:0,nm:"partial",gc:20},MO:{e:13.38,g:2.88,s:4.6,z:"warm",ec:0,sc:0,nm:"full",gc:18},MT:{e:12.45,g:3.25,s:4.8,z:"cold",ec:0,sc:500,nm:"full",gc:55},NE:{e:12.11,g:3.02,s:4.8,z:"cold",ec:0,sc:0,nm:"partial",gc:32},NV:{e:13.15,g:3.85,s:6.2,z:"hot",ec:0,sc:0,nm:"full",gc:35},NH:{e:22.18,g:3.18,s:4.0,z:"cold",ec:0,sc:0,nm:"full",gc:28},NJ:{e:17.96,g:3.12,s:4.4,z:"mild",ec:4000,sc:0,nm:"full",gc:42},NM:{e:14.55,g:3.08,s:6.2,z:"hot",ec:0,sc:0,nm:"full",gc:32},NY:{e:22.58,g:3.35,s:3.9,z:"cold",ec:2000,sc:0,nm:"full",gc:40},NC:{e:12.85,g:2.98,s:5.0,z:"warm",ec:0,sc:0,nm:"full",gc:30},ND:{e:11.85,g:3.08,s:4.5,z:"cold",ec:0,sc:0,nm:"full",gc:42},OH:{e:14.72,g:3.02,s:4.0,z:"cold",ec:0,sc:0,nm:"full",gc:22},OK:{e:12.18,g:2.75,s:5.2,z:"warm",ec:0,sc:0,nm:"full",gc:45},OR:{e:12.45,g:3.68,s:4.2,z:"mild",ec:2500,sc:0,nm:"full",gc:72},PA:{e:16.82,g:3.22,s:4.1,z:"cold",ec:0,sc:0,nm:"full",gc:35},RI:{e:24.85,g:3.18,s:4.2,z:"cold",ec:2500,sc:0,nm:"full",gc:38},SC:{e:14.08,g:2.85,s:5.0,z:"warm",ec:0,sc:0,nm:"full",gc:28},SD:{e:13.02,g:3.05,s:4.8,z:"cold",ec:0,sc:0,nm:"partial",gc:40},TN:{e:12.48,g:2.82,s:4.7,z:"warm",ec:0,sc:0,nm:"partial",gc:22},TX:{e:13.95,g:2.72,s:5.5,z:"hot",ec:0,sc:0,nm:"partial",gc:32},UT:{e:11.58,g:3.28,s:5.8,z:"cold",ec:0,sc:0,nm:"full",gc:25},VT:{e:20.15,g:3.25,s:3.8,z:"cold",ec:4000,sc:0,nm:"full",gc:100},VA:{e:13.52,g:3.02,s:4.6,z:"mild",ec:0,sc:0,nm:"full",gc:32},WA:{e:11.32,g:3.85,s:3.8,z:"mild",ec:0,sc:0,nm:"full",gc:78},WV:{e:12.85,g:2.95,s:4.0,z:"cold",ec:0,sc:0,nm:"none",gc:8},WI:{e:16.12,g:3.08,s:4.0,z:"cold",ec:0,sc:0,nm:"full",gc:22},WY:{e:11.55,g:3.18,s:5.2,z:"cold",ec:0,sc:0,nm:"full",gc:18}};

const VEHICLES={ev:[{id:"model3lr",name:"Tesla Model 3 LR",kwh:25.0,msrp:42490,fc:7500},{id:"modely",name:"Tesla Model Y LR",kwh:27.5,msrp:47990,fc:7500},{id:"ioniq5",name:"Hyundai Ioniq 5",kwh:29.0,msrp:43800,fc:7500},{id:"bolt",name:"Chevy Equinox EV",kwh:30.0,msrp:34995,fc:7500},{id:"mache",name:"Ford Mach-E",kwh:32.0,msrp:42995,fc:3750},{id:"id4",name:"VW ID.4",kwh:31.0,msrp:39735,fc:7500}],ice:[{id:"camry",name:"Toyota Camry",mpg:32,msrp:29495},{id:"civic",name:"Honda Civic",mpg:36,msrp:25945},{id:"rav4",name:"Toyota RAV4",mpg:30,msrp:31380},{id:"crv",name:"Honda CR-V",mpg:30,msrp:31450},{id:"corolla",name:"Toyota Corolla",mpg:35,msrp:23495}]};
const CP={cold:.22,mild:.05,warm:.03,hot:.04};

// ─── PRODUCT DATABASE (real research-based assessments) ───
const SOLAR_PANELS = [
  { id:1,name:"Renogy 200W Portable Suitcase",brand:"Renogy",watts:200,price:259,rating:4.5,reviews:3847,type:"Foldable Monocrystalline",weight:"18.7 lbs",warranty:"5 years",
    bestFor:"RV & Camping",efficiency:"22.8%",
    prosRaw:["Included 20A charge controller saves $40+","Aluminum frame + tempered glass = serious durability","Adjustable kickstand that actually holds in wind","Works with lithium AND lead-acid batteries"],
    consRaw:["Heavy for hiking — this is a vehicle panel","No USB ports — MC4 connectors only, need adapter for phones","Suitcase latch can feel cheap on some units"],
    verdict:"The gold standard for RV and off-grid camping. Renogy has been doing this longer than most competitors and it shows. The included charge controller is a genuine value-add that saves you a separate purchase. Not for backpackers — at nearly 19 lbs this lives in your vehicle. Reviewers consistently praise longevity; many report 3+ years of regular use with no degradation. The biggest complaint is the MC4-only output, meaning you'll need an adapter if you want to charge USB devices directly.",
    quirks:"The charge controller has soldered fuses that some users find hard to replace. A few reports of backwards-wired solar ports on adapter cables — always check polarity. Panel produces roughly 60-75% of rated wattage in real conditions.",
    peopleSay:"Owner-reported output averages 140-160W in direct sun. Very popular with the van life community. Dozens of reviews mention surviving years of use on RV rooftops. Some complaints about customer service response times.",
    tags:["Editor's Pick","Best for RV"] },
  { id:2,name:"Jackery SolarSaga 200W",brand:"Jackery",watts:200,price:499,rating:4.4,reviews:1256,type:"Foldable Monocrystalline",weight:"17.6 lbs",warranty:"3 years",
    bestFor:"Jackery Ecosystem",efficiency:"24.3%",
    prosRaw:["Plug-and-play with Jackery power stations","Higher cell efficiency than most competitors","Excellent build quality and finish","IP67 water resistance rating"],
    consRaw:["Locked into Jackery ecosystem — proprietary connector","Nearly double the price of Renogy for similar wattage","Shorter warranty (3yr vs 5yr competitors)","Need $25 adapter cable for non-Jackery batteries"],
    verdict:"Premium build quality at a premium price. If you already own a Jackery power station, this is the seamless companion — true plug-and-play with zero adapter hassle. But if you don't, you're paying a significant brand tax. The 24.3% efficiency is genuinely above average, and the IP67 rating means real weather resistance, not just marketing. The shorter 3-year warranty is disappointing at this price point. Think of it as the Apple of solar panels: beautiful, integrated, expensive.",
    quirks:"The proprietary Anderson connector means you can't easily mix brands. Some users report the kickstand is less sturdy than Renogy's. Real-world output closer to 50-65% of rated in typical conditions — same as everyone, despite the marketing.",
    peopleSay:"Jackery owners love it. Non-Jackery owners feel overcharged. Camping forums rate build quality highly but note Renogy gives better watts-per-dollar. Very positive reviews from the 'I just want it to work' crowd.",
    tags:["Premium Pick"] },
  { id:3,name:"BigBlue SolarPowa 28W",brand:"BigBlue",watts:28,price:65,rating:4.3,reviews:5621,type:"Foldable Monocrystalline",weight:"1.3 lbs",warranty:"2 years",
    bestFor:"Phone & Tablet Charging",efficiency:"23.4%",
    prosRaw:["Ultra-light at 1.3 lbs — truly backpackable","3 USB outputs (1x USB-C, 2x USB-A)","Under $65 — lowest entry point for useful solar","Charges phones at reasonable speed in direct sun"],
    consRaw:["28W won't charge a power station meaningfully","No battery — stops charging when clouds pass","Inconsistent output in partial shade","USB-C maxes at 18W, not fast-charge for newer phones"],
    verdict:"The entry-level recommendation that actually works. At 1.3 lbs you'll barely notice it in a pack, and the triple-USB output means you can charge phone + watch + earbuds simultaneously. Don't expect to power anything serious — this is a device charger, not a power source. Independent testing found it to be the most consistent USB panel in its class. The lack of any battery means it hiccups when clouds roll by, which drives some users crazy.",
    quirks:"Output drops dramatically if even one cell is shaded — position carefully. The built-in smart-IC chip sometimes resets device charging when clouds pass, meaning your phone may not auto-resume. Works best hung from a backpack at the right angle.",
    peopleSay:"Hikers and through-hikers swear by it. Common complaints: inconsistent charging in mixed sun. Common praise: survived rain, drops, and years of abuse. Multiple reviewers call it 'the best $65 I ever spent on gear.'",
    tags:["Budget Pick","Best for Hiking"] },
  { id:4,name:"EcoFlow 220W Bifacial",brand:"EcoFlow",watts:220,price:449,rating:4.6,reviews:987,type:"Bifacial Monocrystalline",weight:"20.5 lbs",warranty:"4 years",
    bestFor:"Maximum Output",efficiency:"23%",
    prosRaw:["Bifacial design collects reflected light from ground (+10-25%)","Self-supporting kickstand — no leaning needed","Highest real-world output in testing","Waterproof to IP68"],
    consRaw:["Heavy — not portable for long carries","Expensive for a panel (though output justifies cost)","Bifacial benefit requires reflective ground surface","Large folded size compared to similar wattage"],
    verdict:"The most technologically interesting panel on the market. The bifacial design genuinely works — on snow, sand, or light concrete, reviewers report 10-25% more power than rated. That said, on dark grass or dirt the benefit is minimal. EcoFlow's build quality is excellent and the integrated kickstand is best-in-class. If you need maximum watts for quick charging and don't mind the weight, this delivers. The IP68 rating is the highest waterproofing in the category.",
    quirks:"The bifacial gain varies wildly by surface — 25% on snow, maybe 5% on grass. The self-supporting design is great but catches wind like a sail. Some users report the proprietary EcoFlow cable limits compatibility, though adapters exist. Panel efficiency measurement includes bifacial gain, so direct-sun-only performance is closer to 19-20%.",
    peopleSay:"Tech reviewers rate it highest. Overlanders love it. Backyard preppers say the bifacial is oversold for suburban use. Multiple comparison tests show it consistently outproduces competitors by 15-20% in ideal conditions.",
    tags:["Tech Pick","Best Output"] },
  { id:5,name:"BougeRV Yuma 200W CIGS",brand:"BougeRV",watts:200,price:379,rating:4.2,reviews:642,type:"Thin-Film CIGS (Flexible)",weight:"8.4 lbs",warranty:"5 years",
    bestFor:"Curved Surfaces & RV Roofs",efficiency:"15.8%",
    prosRaw:["Incredibly thin and flexible — mounts on curved surfaces","Under 9 lbs for 200W — best power-to-weight ratio","Peel-and-stick mounting option","Better shade tolerance than crystalline panels"],
    consRaw:["Lower efficiency (15.8%) means you need more area","CIGS technology is less proven long-term than silicon","More expensive per watt than rigid panels","Scratches more easily — no glass protection"],
    verdict:"A genuinely different approach. CIGS thin-film technology lets this panel flex and conform to curved RV roofs, boat decks, or any irregular surface. At 8.4 lbs for 200W, the power-to-weight ratio is remarkable. The trade-off is lower efficiency — you'll need about 30% more area to match a rigid panel's output. The shade tolerance advantage is real: partial shading causes less output drop than crystalline panels. An exciting technology for specific use cases, but not the best all-rounder.",
    quirks:"The peel-and-stick adhesive is permanent — plan your mounting carefully. Some users report the thin laminate surface scratches easily during transport. CIGS degradation rates are less well-documented than silicon — Wattfull rates long-term confidence as moderate. Temperature coefficient is actually better than silicon, meaning it performs relatively better in hot climates.",
    peopleSay:"RV and boat owners love the form factor. Skeptics question long-term durability. Several reviewers note performance matches or beats rated specs in hot weather. Installation on curved surfaces gets consistently rave reviews — 'game-changer' is used frequently.",
    tags:["Most Innovative"] },
  { id:6,name:"FlexSolar 40W Portable",brand:"FlexSolar",watts:40,price:79,rating:4.3,reviews:1834,type:"Foldable Monocrystalline",weight:"2.9 lbs",warranty:"2 years",
    bestFor:"Portable Power Station Charging",efficiency:"23%",
    prosRaw:["DC output charges power stations faster than USB-only panels","Compact book-size when folded","No velcro or magnets — unfolds flat instantly","USB-C + USB-A + DC output = maximum versatility"],
    consRaw:["40W is still slow for larger power stations","DC cable compatibility varies by brand","At $79, the per-watt cost is higher than larger panels","Kickstand is basic — needs propping"],
    verdict:"Hits a sweet spot between the ultra-compact BigBlue and the heavy-duty 200W panels. The DC output is the key differentiator — it charges portable power stations meaningfully faster than USB-only panels. In independent testing, this panel charged a 240Wh power station faster than any other sub-50W panel via DC output. The triple-output versatility (USB-C, USB-A, DC) means one panel handles phones, tablets, and battery stations. Not a primary power source, but an excellent 'always in the car' backup.",
    quirks:"The DC output voltage varies with sunlight — check your power station's input range compatibility. No clasps or fasteners means it doesn't stay folded in a bag without a rubber band or case. Some users wish the DC cable were longer.",
    peopleSay:"Praised for portability-to-power ratio. The 'no velcro' design gets surprisingly passionate positive reviews. Power station owners appreciate the DC output specifically. A few reviewers note it charges EcoFlow and Jackery stations well with the right adapter.",
    tags:["Best Mid-Range"] }
];

const POWER_STATIONS = [
  { id:1,name:"Anker SOLIX C1000",brand:"Anker",capacity:"1,056 Wh",output:"1,800W",price:649,rating:4.6,reviews:2156,weight:"28 lbs",battery:"LiFePO4",cycles:"3,000+",warranty:"5 years",
    bestFor:"Best Overall",
    prosRaw:["Outstanding value — regularly on sale under $500","LiFePO4 battery rated 3,000+ cycles (8+ years daily use)","11 output ports including 2× 100W USB-C","Recharges 0-100% in 58 minutes via AC","HyperFlash technology doesn't degrade battery"],
    consRaw:["No built-in light (competitors include one)","App can be buggy — works fine without it","Fan is audible under high load","Single unit, no expansion battery option"],
    verdict:"The consensus pick across virtually every review site for good reason. Anker hit the sweet spot of price, capacity, build quality, and charging speed. The 58-minute full recharge is legitimately impressive and uses their HyperFlash tech that supposedly doesn't hurt battery longevity. The 5-year warranty and LiFePO4 chemistry mean this should last a very long time. At sale prices under $500, it's arguably the best value in the entire category. The lack of expansion options is the main limitation — if you need more capacity later, you'd need a second unit.",
    quirks:"The app adds smart features but isn't necessary — physical buttons control everything. Under heavy load the internal fan runs at a noticeable volume. The 1,800W output handles most appliances but won't run a full-size space heater. Some users report the display is hard to read in direct sunlight.",
    peopleSay:"Consistently rated #1 or #2 across major review sites. Camping and vanlife communities praise the size-to-power ratio. Emergency preppers appreciate the fast recharge. The most common review phrase: 'best bang for the buck.' Complaint frequency is remarkably low for a product in this category.",
    tags:["Editor's Pick","Best Value"] },
  { id:2,name:"EcoFlow DELTA 2 Max",brand:"EcoFlow",capacity:"2,048 Wh",output:"2,400W",price:1599,rating:4.5,reviews:1823,weight:"50.7 lbs",battery:"LiFePO4",cycles:"3,000+",warranty:"5 years",
    bestFor:"Home Backup",
    prosRaw:["Massive 2,048Wh covers extended outages","15 output ports — the most of any competitor","X-Boost handles up to 3,400W surge loads","Expandable to 6,144Wh with add-on batteries","Excellent companion app with smart controls"],
    consRaw:["50.7 lbs — not truly portable","$1,599 MSRP is serious money","Complex feature set has a learning curve","Loud fan under high loads"],
    verdict:"The serious home backup option. At 2,048Wh with expansion to 6,144Wh, this can genuinely get you through a multi-hour outage running fridge, lights, router, and devices. EcoFlow's X-Boost technology lets it handle appliances rated above its nominal output, which is clever engineering. The 15 ports mean you'll never run out of outlets. The trade-off: it's heavy, expensive, and has more features than many people need. If you're specifically planning for power outages or building a solar-charged home backup system, this is the right choice. For camping, it's overkill and too heavy.",
    quirks:"The X-Boost feature works by reducing voltage to run over-rated appliances — your hair dryer will work but may run slightly slower. The expansion batteries are expensive ($900+). Some units shipped with firmware bugs that required app updates. The 'Eco mode' timeout can turn off the station while you're using low-draw devices — requires adjustment in settings.",
    peopleSay:"Homeowners and emergency preppers rate it highest. Weekend campers say it's too heavy and expensive for their needs. RV owners love the expansion capability. The companion app gets mixed reviews — powerful but sometimes glitchy. Several reviewers specifically mention it kept their fridge running during multi-day power outages.",
    tags:["Best Home Backup"] },
  { id:3,name:"Jackery Explorer 1000 v2",brand:"Jackery",capacity:"1,070 Wh",output:"1,500W",price:799,rating:4.4,reviews:3421,weight:"23.8 lbs",battery:"LiFePO4",cycles:"4,000",warranty:"5 years",
    bestFor:"Camping & Ease of Use",
    prosRaw:["Lightest in class at 23.8 lbs for 1,000Wh","Most intuitive interface — the 'iPhone of power stations'","Full recharge in ~60 minutes","Color-coded cables and clear display","4,000 cycle rating — best-in-class longevity"],
    consRaw:["$799 is pricier than Anker for less output","Fewer ports than EcoFlow (8 vs 15)","Proprietary solar connector limits panel choices","Not expandable — what you buy is what you get"],
    verdict:"The user experience champion. Every reviewer comments on how easy Jackery products are to use — the display is clear, the cables are color-coded, and the interface is intuitive. The 4,000 cycle rating on the LiFePO4 battery means this could last 11+ years of daily cycling, which is exceptional. At 23.8 lbs, it's noticeably lighter than competitors at this capacity. The premium over Anker is essentially a user experience tax. If you want the easiest, most pleasant device to use and don't mind paying for it, this is it.",
    quirks:"Jackery solar panels work seamlessly; third-party panels require a $25 adapter cable. Some units have had housing durability concerns — one independent tester reported a crack forming. The app is less feature-rich than EcoFlow's. Power button is on the back of the unit, which is an odd design choice.",
    peopleSay:"'It just works' is the most common sentiment. Families and less tech-savvy users particularly appreciate the simplicity. Frequent comparison to Apple products. Some power users find it limiting. The orange color scheme is polarizing — people either love or hate the aesthetic. Long-term owners report excellent reliability over 2+ years.",
    tags:["Easiest to Use"] },
  { id:4,name:"Bluetti AC70",brand:"Bluetti",capacity:"768 Wh",output:"1,000W (2,000W peak)",price:449,rating:4.3,reviews:1029,weight:"22.5 lbs",battery:"LiFePO4",cycles:"3,500+",warranty:"5 years",
    bestFor:"Best Budget LiFePO4",
    prosRaw:["Best price-to-capacity for LiFePO4 chemistry","2,000W surge handles demanding startups","70-minute charge to 80% via AC","Bright, clear display that's easy to read","Turbo charging mode for emergencies"],
    consRaw:["Fan is louder than average under load","768Wh is the smallest in this lineup","App has had connectivity issues","Bluetooth-only control (no WiFi)"],
    verdict:"The budget entry into serious LiFePO4 power stations. At $449, the AC70 undercuts its competitors by $200+ while still delivering LiFePO4 longevity, solid build quality, and enough capacity for a weekend camping trip or short power outage. The 2,000W peak surge is genuinely useful — it means the station can handle the startup spike of a small fridge or power tool. The fan noise is the main quality compromise; under high load, it's noticeably louder than Anker or Jackery. If budget matters more than polish, this is the smart buy.",
    quirks:"The fan noise has been the #1 complaint across review sites. Bluetti's app uses Bluetooth only (no WiFi), which limits range. The turbo charging mode is fast but generates significant heat. Some users report inconsistent solar charging performance — may depend on panel brand compatibility. The display brightness is actually a standout positive.",
    peopleSay:"Budget-conscious buyers love it. Side-by-side with the Anker, users note the louder fan and slightly less polished feel. The value proposition is undeniable. Bluetti's customer service gets mixed reviews — some report great support, others report slow responses. Multiple camping forums recommend it as a first power station purchase.",
    tags:["Budget Pick"] },
  { id:5,name:"EcoFlow River 3 Plus",brand:"EcoFlow",capacity:"286 Wh",output:"600W",price:219,rating:4.5,reviews:763,weight:"7.8 lbs",battery:"LiFePO4",cycles:"3,000+",warranty:"5 years",
    bestFor:"Ultra-Portable",
    prosRaw:["Incredibly compact at 7.8 lbs","GaN technology runs cooler and more efficiently","Built-in light with multiple modes","Charges laptops, drones, cameras","X-Boost handles appliances up to 600W"],
    consRaw:["286Wh is small — one laptop charge depletes half","Won't run any serious appliances","Higher per-Wh cost than larger stations","USB-C output maxes at 100W"],
    verdict:"The 'always in the car' power station. At under 8 lbs, it goes everywhere. The GaN (Gallium Nitride) technology is the real differentiator — it runs cooler, charges faster, and is more efficient than traditional inverters. The built-in light is surprisingly useful and something competitors overlook. Don't expect to run a fridge or anything demanding — this is for laptops, phones, cameras, drones, and CPAP machines. For that specific use case, nothing beats it on size and convenience. The new budget champion for sub-300Wh stations.",
    quirks:"The compact size means heat management is important — avoid enclosing it during heavy use. The X-Boost feature works but can be finicky with some appliances. Battery percentage can jump around near 0% and 100%. The built-in light has a motion-detection mode that's genuinely clever for camping.",
    peopleSay:"Road-trippers and weekend campers love it. Photographers and drone pilots specifically praise it. The 'throw it in the trunk and forget about it' form factor resonates strongly. A few complaints about the small capacity for the price, but most acknowledge the premium is for portability. Multiple reviewers call it the best sub-$250 power station available.",
    tags:["Most Portable","Great for Travel"] },
  { id:6,name:"Goal Zero Yeti 500",brand:"Goal Zero",capacity:"505 Wh",output:"500W",price:399,rating:4.4,reviews:2187,weight:"14 lbs",battery:"NMC Li-ion",cycles:"500",warranty:"2 years",
    bestFor:"Extreme Weather",
    prosRaw:["Rated to -4°F — best cold weather performance","Unique storm hood protects ports from elements","Premium build quality and materials","Simple, no-app-needed operation","Established brand with proven track record"],
    consRaw:["NMC battery = only 500 cycles (vs 3,000+ LiFePO4)","Shorter 2-year warranty","Higher price per Wh than LiFePO4 competitors","Heavier than similar-capacity LiFePO4 units","Older battery technology"],
    verdict:"A legacy pick for a specific audience. Goal Zero has been in this space longer than anyone, and the Yeti 500 reflects that heritage — it's built like a tank and rated to -4°F, which no competitor matches. The storm hood covering the ports is a unique and practical design. However, the NMC battery chemistry is the critical weakness: 500 cycles vs. 3,000+ for LiFePO4 competitors means this battery will degrade meaningfully faster. The 2-year warranty reflects that shorter lifespan. If you need reliable power in extreme cold and harsh weather, this earns its price. For everyone else, the LiFePO4 options above are better long-term investments.",
    quirks:"The extreme cold rating is the genuine differentiator — LiFePO4 batteries struggle below freezing. No app means no firmware updates or smart features, which is either a pro or con depending on your perspective. The charging cables are proprietary and somewhat expensive to replace. Goal Zero's legacy in the space means excellent third-party accessory ecosystem.",
    peopleSay:"Mountain climbers, ice fishers, and cold-weather campers specifically recommend it. Other buyers feel it's overpriced for the capacity and cycle life. The brand loyalty is strong — many Goal Zero owners have multiple units. Common sentiment: 'It just works, every time, in any condition.' Long-term owners do report noticeable capacity fade after 2-3 years of heavy use.",
    tags:["Best for Cold Weather"] }
];

// ─── UI COMPONENTS ───
const Stars=({n,T:t})=>{const full=Math.floor(n),half=n%1>=0.5;return <span style={{display:"inline-flex",gap:1}}>{Array.from({length:5},(_, i)=><span key={i} style={{color:i<full||(i===full&&half)?t.star:t.border,fontSize:14}}>{i<full?"★":(i===full&&half?"★":"☆")}</span>)}</span>};

const Badge=({type,children,t})=>{
  const s={estimated:{bg:t.warnBg,color:t.warn},real:{bg:t.greenLight,color:t.greenDark},info:{bg:t.blueBg,color:t.blue},tag:{bg:t.greenLight,color:t.greenDark}};
  const c=s[type]||s.info;
  return <span style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:4,background:c.bg,color:c.color,whiteSpace:"nowrap"}}>{children}</span>;
};

const Tip=({text,t})=>{const[s,setS]=useState(false);return <span style={{position:"relative",display:"inline-flex",marginLeft:4}}><button onClick={()=>setS(!s)} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:"50%",width:18,height:18,fontSize:11,color:t.textLight,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0}}>?</button>{s&&<div style={{position:"absolute",bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",background:t.text,color:t.bg,fontSize:12,lineHeight:1.5,padding:"8px 12px",borderRadius:8,width:220,zIndex:10,boxShadow:`0 4px 16px ${t.shadow}`}}>{text}</div>}</span>};

const Input=({label,tip,value,onChange,type="text",suffix,prefix,min,max,step,error,t,...rest})=>(
  <div style={{marginBottom:14}}>
    <label style={{fontSize:13,fontWeight:600,color:t.textMid,display:"flex",alignItems:"center",gap:4,marginBottom:6}}>{label}{tip&&<Tip text={tip} t={t}/>}</label>
    <div style={{display:"flex",alignItems:"center",border:`1.5px solid ${error?t.err:t.border}`,borderRadius:10,background:t.white,overflow:"hidden"}}>
      {prefix&&<span style={{padding:"0 0 0 12px",color:t.textLight,fontSize:14}}>{prefix}</span>}
      <input value={value} onChange={e=>onChange(type==="number"?(e.target.value===""?"":Number(e.target.value)):e.target.value)} type={type} min={min} max={max} step={step} style={{border:"none",outline:"none",padding:"11px 12px",fontSize:14,width:"100%",background:"transparent",color:t.text}} {...rest}/>
      {suffix&&<span style={{padding:"0 12px 0 0",color:t.textLight,fontSize:13,whiteSpace:"nowrap"}}>{suffix}</span>}
    </div>
    {error&&<div style={{fontSize:12,color:t.err,marginTop:4}}>{error}</div>}
  </div>
);

const Select=({label,value,onChange,options,t,tip})=>(
  <div style={{marginBottom:14}}>
    <label style={{fontSize:13,fontWeight:600,color:t.textMid,display:"flex",alignItems:"center",gap:4,marginBottom:6}}>{label}{tip&&<Tip text={tip} t={t}/>}</label>
    <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",border:`1.5px solid ${t.border}`,borderRadius:10,padding:"11px 12px",fontSize:14,background:t.white,color:t.text,cursor:"pointer",outline:"none"}}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
  </div>
);

const Slider=({label,value,onChange,min,max,step=1,suffix="",tip,t})=>(
  <div style={{marginBottom:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <label style={{fontSize:13,fontWeight:600,color:t.textMid,display:"flex",alignItems:"center",gap:4}}>{label}{tip&&<Tip text={tip} t={t}/>}</label>
      <span style={{fontSize:14,fontWeight:700,color:t.text}}>{typeof value==="number"?value.toLocaleString():value}{suffix}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",accentColor:t.green,cursor:"pointer"}}/>
  </div>
);

const Toggle=({label,value,onChange,tip,t})=>(
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,padding:"6px 0"}}>
    <label style={{fontSize:13,fontWeight:600,color:t.textMid,display:"flex",alignItems:"center",gap:4}}>{label}{tip&&<Tip text={tip} t={t}/>}</label>
    <button onClick={()=>onChange(!value)} style={{width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",position:"relative",transition:"background .2s",background:value?t.green:t.border}}>
      <div style={{width:20,height:20,borderRadius:10,background:"#fff",position:"absolute",top:2,transition:"left .2s",left:value?22:2,boxShadow:"0 1px 4px rgba(0,0,0,.15)"}}/>
    </button>
  </div>
);

const Collapsible=({title,children,defaultOpen=false,t})=>{const[o,setO]=useState(defaultOpen);return <div style={{borderTop:`1px solid ${t.borderLight}`,marginTop:8}}><button onClick={()=>setO(!o)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",background:"none",border:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:t.textMid}}>{title}<span style={{transform:o?"rotate(180deg)":"none",transition:"transform .2s",fontSize:12}}>▼</span></button>{o&&<div style={{paddingBottom:14}}>{children}</div>}</div>};

const ChartTip=({active,payload,label,prefix="",suffix="",t})=>{if(!active||!payload?.length)return null;return <div style={{background:t.white,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",boxShadow:`0 2px 12px ${t.shadow}`,fontSize:13}}><div style={{color:t.textLight,fontSize:11,marginBottom:4}}>{label}</div>{payload.map((p,i)=><div key={i} style={{color:p.color||t.text,fontWeight:600}}>{p.name}: {prefix}{typeof p.value==="number"?p.value.toLocaleString():p.value}{suffix}</div>)}</div>};

const fmt=n=>Math.abs(n)>=1000?`$${(n/1000).toFixed(1)}k`:`$${n}`;

// ─── ANIMATED COUNTER ───
const AnimCount=({end,prefix="",suffix="",duration=1200,t})=>{const[v,setV]=useState(0);const ref=useRef();useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){let s=performance.now();const a=()=>{const p=Math.min((performance.now()-s)/duration,1);setV(Math.round(end*p*p));if(p<1)requestAnimationFrame(a)};a();obs.disconnect()}},{threshold:.3});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect()},[end,duration]);return <span ref={ref} style={{fontWeight:800,color:t.text,fontVariantNumeric:"tabular-nums"}}>{prefix}{v.toLocaleString()}{suffix}</span>};

// ─── PRODUCT CARD ───
const ProductCard=({product,type,t,onSelect,selected})=>(
  <div onClick={()=>onSelect(product.id)} style={{background:selected?t.greenLight:t.white,border:`1.5px solid ${selected?t.green:t.borderLight}`,borderRadius:14,padding:20,cursor:"pointer",transition:"all .2s"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:t.textLight,textTransform:"uppercase",letterSpacing:".04em"}}>{product.brand}</div>
        <div style={{fontSize:16,fontWeight:700,color:t.text,marginTop:2}}>{product.name}</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:20,fontWeight:800,color:t.green}}>${product.price}</div>
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
      <Stars n={product.rating} T={t}/><span style={{fontSize:12,color:t.textLight}}>({product.reviews.toLocaleString()})</span>
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
      {product.tags?.map(tag=><Badge key={tag} type="tag" t={t}>{tag}</Badge>)}
      <span style={{fontSize:12,color:t.textMid,padding:"3px 0"}}>{type==="panel"?`${product.watts}W · ${product.weight}`:`${product.capacity} · ${product.weight}`}</span>
    </div>
    <div style={{fontSize:13,color:t.textMid,lineHeight:1.5}}>{product.bestFor&&<span style={{fontWeight:600}}>Best for: </span>}{product.bestFor}</div>
  </div>
);

// ─── PRODUCT DETAIL ───
const ProductDetail=({product,type,t})=>{
  const[tab,setTab]=useState("verdict");
  const tabs=[{id:"verdict",label:"Our Take"},{id:"pros",label:"Pros & Cons"},{id:"people",label:"What People Say"},{id:"quirks",label:"Quirks & Gotchas"}];
  return(
    <div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:24,borderBottom:`1px solid ${t.borderLight}`}}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:t.green,textTransform:"uppercase",letterSpacing:".05em"}}>{product.brand}</div>
            <h3 style={{fontSize:22,fontWeight:800,color:t.text,marginTop:4}}>{product.name}</h3>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
              <Stars n={product.rating} T={t}/>
              <span style={{fontSize:13,color:t.textMid}}>{product.rating}/5 from {product.reviews.toLocaleString()} reviews</span>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:28,fontWeight:800,color:t.green}}>${product.price}</div>
            <a href="#" onClick={e=>e.preventDefault()} style={{fontSize:13,color:t.green,fontWeight:600,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4,marginTop:4,padding:"6px 14px",border:`1.5px solid ${t.green}`,borderRadius:8}}>View on Amazon →</a>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))",gap:12,marginTop:16}}>
          {(type==="panel"?[
            {l:"Wattage",v:`${product.watts}W`},{l:"Efficiency",v:product.efficiency},{l:"Weight",v:product.weight},{l:"Type",v:product.type?.split(" ")[0]},{l:"Warranty",v:product.warranty}
          ]:[
            {l:"Capacity",v:product.capacity},{l:"Output",v:product.output},{l:"Battery",v:product.battery},{l:"Cycles",v:product.cycles},{l:"Warranty",v:product.warranty}
          ]).map((s,i)=>(
            <div key={i} style={{padding:10,background:t.card,borderRadius:8,textAlign:"center"}}>
              <div style={{fontSize:11,color:t.textLight,fontWeight:600}}>{s.l}</div>
              <div style={{fontSize:14,fontWeight:700,color:t.text,marginTop:2}}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${t.borderLight}`,overflow:"auto"}}>
        {tabs.map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)} style={{padding:"12px 20px",fontSize:13,fontWeight:tab===tb.id?700:500,color:tab===tb.id?t.green:t.textMid,background:"none",border:"none",borderBottom:tab===tb.id?`2px solid ${t.green}`:"2px solid transparent",cursor:"pointer",whiteSpace:"nowrap"}}>{tb.label}</button>
        ))}
      </div>
      <div style={{padding:24}}>
        {tab==="verdict"&&<div style={{fontSize:14,color:t.textMid,lineHeight:1.75}}>{product.verdict}</div>}
        {tab==="pros"&&<div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:t.greenDark,marginBottom:8}}>STRENGTHS</div>
            {product.prosRaw.map((p,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6,fontSize:14,color:t.textMid,lineHeight:1.5}}><span style={{color:t.green,flexShrink:0}}>✓</span>{p}</div>)}
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:t.err,marginBottom:8}}>WEAKNESSES</div>
            {product.consRaw.map((c,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6,fontSize:14,color:t.textMid,lineHeight:1.5}}><span style={{color:t.err,flexShrink:0}}>✗</span>{c}</div>)}
          </div>
        </div>}
        {tab==="people"&&<div style={{fontSize:14,color:t.textMid,lineHeight:1.75}}>{product.peopleSay}</div>}
        {tab==="quirks"&&<div style={{fontSize:14,color:t.textMid,lineHeight:1.75}}>{product.quirks}</div>}
      </div>
      <div style={{padding:"12px 24px 16px",borderTop:`1px solid ${t.borderLight}`,display:"flex",gap:8,justifyContent:"flex-end"}}>
        <a href="#" onClick={e=>e.preventDefault()} style={{fontSize:13,fontWeight:600,color:"#fff",background:t.green,padding:"10px 20px",borderRadius:8,textDecoration:"none"}}>Check Price on Amazon →</a>
      </div>
    </div>
  );
};

// ─── EV CALC ───
function EVCalcPage({t}){
  const[zip,setZip]=useState("");const[st,setSt]=useState(null);const[sd,setSd2]=useState(null);const[evId,setEvId]=useState("model3lr");const[iceId,setIceId]=useState("camry");const[mi,setMi]=useState(12000);const[yr,setYr]=useState(8);const[hc,setHc]=useState(85);const[pc,setPc]=useState(10);const[dc,setDc]=useState(5);const[eo,setEo]=useState("");const[go,setGo]=useState("");const[incI,setIncI]=useState(true);const[incC,setIncC]=useState(true);const[res,setRes]=useState(null);const[err,setErr]=useState({});
  useEffect(()=>{if(zip.length===5){const s=zipToState(zip);setSt(s);setSd2(s?SD[s]:null)}else{setSt(null);setSd2(null)}},[zip]);
  const ev=VEHICLES.ev.find(v=>v.id===evId),ice=VEHICLES.ice.find(v=>v.id===iceId);
  const calc=()=>{
    const e={};if(!/^\d{5}$/.test(zip)||!st)e.zip="Valid 5-digit ZIP required";if(mi<1000||mi>50000)e.mi="1,000–50,000";if(hc+pc+dc!==100)e.ch="Must total 100%";setErr(e);if(Object.keys(e).length)return;
    const er=eo!==""?Number(eo):sd.e,gp=go!==""?Number(go):sd.g,cp=CP[sd.z]||.1;
    const kwhMi=(ev.kwh/100)*(incC?1+cp:1),blend=(hc/100)*(er/100)*1.12+(pc/100)*(er/100+.18)*1.06+(dc/100)*.35;
    const evF=kwhMi*mi*blend,iceF=(mi/ice.mpg)*gp,evM=.065*mi,iceM=.1*mi;
    let inc=0;if(incI)inc=ev.fc+(sd.ec||0);
    const yd=[];let ec=0,ic=0,be=null;
    for(let y=1;y<=yr;y++){ec+=evF+evM-(y===1?inc:0);ic+=iceF+iceM;if(!be&&ic-ec>0)be=y;yd.push({year:y,ev:Math.round(ec),ice:Math.round(ic),savings:Math.round(ic-ec)})}
    setRes({yd,total:Math.round(ic-ec),be,evCpm:(ec/(mi*yr)).toFixed(3),iceCpm:(ic/(mi*yr)).toFixed(3),evF:Math.round(evF),iceF:Math.round(iceF),evM:Math.round(evM),iceM:Math.round(iceM),inc,kwhMi:kwhMi.toFixed(3),blend:blend.toFixed(3),sensBest:Math.round((ic-ec)*1.25),sensWorst:Math.round((ic-ec)*.7),er,gp,cp:`${(cp*100).toFixed(0)}%`})
  };
  return(
    <div>
      <h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>EV Savings Calculator</h1>
      <p style={{fontSize:16,color:t.textMid,lineHeight:1.6,marginTop:8,maxWidth:600}}>Compare total ownership costs using your location's actual energy prices, incentives, and climate.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))",gap:28,marginTop:28}}>
        <div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:22}}>
          <Input label="ZIP Code" value={zip} onChange={setZip} error={err.zip} t={t} placeholder="e.g. 90210"/>
          {st&&sd&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}><Badge type="real" t={t}>{st}</Badge><Badge type="estimated" t={t}>{eo||sd.e}¢/kWh</Badge><Badge type="estimated" t={t}>${go||sd.g}/gal</Badge><Badge type="estimated" t={t}>{sd.z}</Badge></div>}
          <Select label="EV" value={evId} onChange={setEvId} t={t} options={VEHICLES.ev.map(v=>({value:v.id,label:`${v.name} — ${v.kwh} kWh/100mi`}))}/>
          <Select label="Gas Vehicle" value={iceId} onChange={setIceId} t={t} options={VEHICLES.ice.map(v=>({value:v.id,label:`${v.name} — ${v.mpg} MPG`}))}/>
          <Slider label="Annual Miles" value={mi} onChange={setMi} min={3000} max={40000} step={1000} t={t}/>
          <Slider label="Years" value={yr} onChange={setYr} min={1} max={15} suffix=" yrs" t={t}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            <Input label="Home%" type="number" value={hc} onChange={setHc} suffix="%" t={t}/>
            <Input label="Public%" type="number" value={pc} onChange={setPc} suffix="%" t={t}/>
            <Input label="DCFC%" type="number" value={dc} onChange={setDc} suffix="%" t={t}/>
          </div>
          {hc+pc+dc!==100&&<div style={{fontSize:12,color:t.err,marginBottom:8}}>Total: {hc+pc+dc}% (need 100%)</div>}
          <Toggle label="Include incentives" value={incI} onChange={setIncI} t={t} tip={`Fed: $${ev?.fc?.toLocaleString()||0} + State: $${sd?.ec?.toLocaleString()||0}`}/>
          <Toggle label="Climate adjustment" value={incC} onChange={setIncC} t={t}/>
          <Collapsible title="Override Rates" t={t}><Input label="Electricity" type="number" value={eo} onChange={setEo} suffix="¢/kWh" t={t}/><Input label="Gas" type="number" value={go} onChange={setGo} prefix="$" suffix="/gal" t={t}/></Collapsible>
          <button onClick={calc} style={{width:"100%",background:t.green,color:"#fff",border:"none",borderRadius:12,padding:"14px 0",fontSize:15,fontWeight:700,cursor:"pointer",marginTop:8,opacity:zip.length===5?1:.5}}>Calculate Savings</button>
        </div>
        <div>
          {!res?<div style={{background:t.card,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:40,textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>⚡</div><h3 style={{fontSize:18,fontWeight:700,color:t.text}}>Enter details & Calculate</h3><p style={{fontSize:14,color:t.textMid,marginTop:8}}>Full breakdown with charts, assumptions, and downloadable data.</p></div>:(
            <div>
              <div style={{background:t.green,borderRadius:14,padding:22,color:"#fff",marginBottom:16}}>
                <div style={{fontSize:12,opacity:.7}}>{yr}-Year Total Savings</div>
                <div style={{fontSize:"clamp(30px,5vw,42px)",fontWeight:800}}>${res.total.toLocaleString()}</div>
                <div style={{display:"flex",gap:16,marginTop:12,flexWrap:"wrap",fontSize:14}}><div><span style={{opacity:.6}}>Break-even:</span> <b>Year {res.be||"—"}</b></div><div><span style={{opacity:.6}}>EV:</span> <b>${res.evCpm}/mi</b></div><div><span style={{opacity:.6}}>ICE:</span> <b>${res.iceCpm}/mi</b></div></div>
                <div style={{marginTop:12,padding:"6px 10px",background:"rgba(255,255,255,.15)",borderRadius:6,fontSize:12}}>Range: ${res.sensWorst.toLocaleString()} to ${res.sensBest.toLocaleString()} (±20% energy)</div>
              </div>
              <div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:18,marginBottom:16}}>
                <div style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:14}}>Cumulative Costs</div>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={res.yd}><defs><linearGradient id="evG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.green} stopOpacity={.12}/><stop offset="95%" stopColor={t.green} stopOpacity={0}/></linearGradient><linearGradient id="iceG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.textLight} stopOpacity={.1}/><stop offset="95%" stopColor={t.textLight} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/><XAxis dataKey="year" tick={{fontSize:11,fill:t.textLight}} axisLine={false} tickLine={false} tickFormatter={v=>`Yr ${v}`}/><YAxis tick={{fontSize:11,fill:t.textLight}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v)}/><Tooltip content={p=><ChartTip {...p} prefix="$" t={t}/>}/><Area type="monotone" dataKey="ice" stroke={t.textLight} strokeWidth={2} fill="url(#iceG)" name="ICE"/><Area type="monotone" dataKey="ev" stroke={t.green} strokeWidth={2.5} fill="url(#evG)" name="EV"/></AreaChart></ResponsiveContainer>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                <div style={{padding:16,background:t.greenLight,borderRadius:10}}><div style={{fontSize:12,fontWeight:700,color:t.greenDark}}>EV Annual</div><div style={{fontSize:13,color:t.textMid,marginTop:6}}>Fuel: <b>${res.evF.toLocaleString()}</b></div><div style={{fontSize:13,color:t.textMid}}>Maint: <b>${res.evM.toLocaleString()}</b></div>{res.inc>0&&<div style={{fontSize:13,color:t.greenDark}}>Credits: <b>−${res.inc.toLocaleString()}</b></div>}</div>
                <div style={{padding:16,background:t.card,borderRadius:10}}><div style={{fontSize:12,fontWeight:700,color:t.textMid}}>ICE Annual</div><div style={{fontSize:13,color:t.textMid,marginTop:6}}>Fuel: <b>${res.iceF.toLocaleString()}</b></div><div style={{fontSize:13,color:t.textMid}}>Maint: <b>${res.iceM.toLocaleString()}</b></div></div>
              </div>
              <Collapsible title="All Assumptions" t={t}><div style={{background:t.card,borderRadius:8,padding:14,fontSize:13,lineHeight:1.8,color:t.textMid}}>
                <div>Electricity: {res.er}¢/kWh (state avg)</div><div>Gas: ${res.gp}/gal (state avg)</div><div>EV efficiency: {res.kwhMi} kWh/mi (with climate)</div><div>Climate penalty: {res.cp}</div><div>Blended charge cost: ${res.blend}/kWh</div><div>Charging: {hc}% home / {pc}% public / {dc}% DCFC</div><div>Home loss: 12% · Public premium: +$0.18/kWh · DCFC: $0.35/kWh</div>
                <div style={{marginTop:8}}><Badge type="estimated" t={t}>State averages from EIA</Badge></div>
              </div></Collapsible>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MARKETPLACE PAGE ───
function MarketplacePage({t}){
  const[tab,setTab]=useState("panels");
  const[selectedPanel,setSelectedPanel]=useState(1);
  const[selectedStation,setSelectedStation]=useState(1);
  const items=tab==="panels"?SOLAR_PANELS:POWER_STATIONS;
  const selected=tab==="panels"?SOLAR_PANELS.find(p=>p.id===selectedPanel):POWER_STATIONS.find(p=>p.id===selectedStation);
  const setSelected=tab==="panels"?setSelectedPanel:setSelectedStation;
  return(
    <div>
      <h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>Gear Reviews & Marketplace</h1>
      <p style={{fontSize:16,color:t.textMid,lineHeight:1.6,marginTop:8,maxWidth:640}}>Independent assessments based on real owner reviews, independent lab testing, and field reports. We read thousands of reviews so you don't have to.</p>
      <div style={{display:"inline-flex",gap:4,padding:4,background:t.card,borderRadius:10,marginTop:20,marginBottom:24}}>
        {[{id:"panels",label:"☀️ Solar Panels"},{id:"stations",label:"🔋 Power Stations"}].map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)} style={{padding:"10px 20px",borderRadius:8,fontSize:14,fontWeight:tab===tb.id?700:500,background:tab===tb.id?t.white:"transparent",color:tab===tb.id?t.text:t.textMid,border:"none",cursor:"pointer",boxShadow:tab===tb.id?`0 1px 4px ${t.shadow}`:"none",transition:"all .2s"}}>{tb.label}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:24}}>
        <div style={{display:"flex",flexDirection:"column",gap:12,maxHeight:720,overflowY:"auto",paddingRight:8}}>
          {items.map(p=><ProductCard key={p.id} product={p} type={tab==="panels"?"panel":"station"} t={t} onSelect={setSelected} selected={p.id===(tab==="panels"?selectedPanel:selectedStation)}/>)}
        </div>
        <div className="detail-col">{selected&&<ProductDetail product={selected} type={tab==="panels"?"panel":"station"} t={t}/>}</div>
      </div>
      <div style={{marginTop:24,padding:14,background:t.card,borderRadius:10,fontSize:12,color:t.textLight,lineHeight:1.6}}>
        <b style={{color:t.textMid}}>Disclosure:</b> Product links may be affiliate links. Wattfull may earn a commission at no cost to you. Affiliate relationships do not influence our ratings or recommendations. All assessments are based on aggregated owner reviews and independent testing data.
      </div>
    </div>
  );
}

// ─── STATE REPORT CARDS ───
function StatesPage({t}){
  const[sel,setSel]=useState(null);
  const states=Object.entries(SD).map(([a,d])=>({a,...d,sc2:Math.round((d.gc+(d.ec>0?20:0)+(d.sc>0?10:0)+(d.nm==="full"?15:d.nm==="partial"?8:0)))})).sort((a,b)=>b.sc2-a.sc2);
  const gr=s=>s>=60?"A":s>=45?"B+":s>=35?"B":s>=25?"C+":s>=15?"C":"D";
  const gc=g=>g.startsWith("A")?t.greenDark:g.startsWith("B")?t.blue:t.textMid;
  const d=sel?states.find(s=>s.a===sel):null;
  return(
    <div>
      <h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>State Energy Report Cards</h1>
      <p style={{fontSize:16,color:t.textMid,lineHeight:1.6,marginTop:8,maxWidth:600}}>Graded on grid cleanliness, EV infrastructure, solar incentives, and utility policies.</p>
      <div style={{display:"flex",gap:8,marginTop:12,marginBottom:24}}><Badge type="estimated" t={t}>EIA, DSIRE, EPA eGRID</Badge><Badge type="info" t={t}>Updated: Jan 2025</Badge></div>
      <div style={{display:"grid",gridTemplateColumns:d?"1fr 1fr":"1fr",gap:24}}>
        <div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{overflowY:"auto",maxHeight:540}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
              <thead><tr style={{background:t.card,position:"sticky",top:0}}><th style={{padding:"10px 14px",textAlign:"left",fontSize:12,fontWeight:600,color:t.textLight}}>State</th><th style={{padding:"10px",textAlign:"center",fontSize:12,fontWeight:600,color:t.textLight}}>Grid</th><th style={{padding:"10px",textAlign:"center",fontSize:12,fontWeight:600,color:t.textLight}}>EV $</th><th style={{padding:"10px",textAlign:"center",fontSize:12,fontWeight:600,color:t.textLight}}>Net Meter</th><th style={{padding:"10px",textAlign:"center",fontSize:12,fontWeight:600,color:t.textLight}}>Grade</th></tr></thead>
              <tbody>{states.map(s=><tr key={s.a} onClick={()=>setSel(s.a)} style={{borderTop:`1px solid ${t.borderLight}`,cursor:"pointer",background:sel===s.a?t.greenLight:"transparent"}}><td style={{padding:"10px 14px",fontWeight:600,color:t.text}}>{s.a}</td><td style={{padding:"10px",textAlign:"center",color:t.textMid}}>{s.gc}%</td><td style={{padding:"10px",textAlign:"center",color:t.textMid}}>{s.ec>0?`$${s.ec.toLocaleString()}`:"—"}</td><td style={{padding:"10px",textAlign:"center"}}><span style={{fontSize:11,padding:"2px 6px",borderRadius:4,background:s.nm==="full"?t.greenLight:s.nm==="partial"?t.warnBg:t.errBg,color:s.nm==="full"?t.greenDark:s.nm==="partial"?t.warn:t.err}}>{s.nm}</span></td><td style={{padding:"10px",textAlign:"center",fontWeight:700,color:gc(gr(s.sc2))}}>{gr(s.sc2)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        {d&&<div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:24}}>
          <h2 style={{fontSize:22,fontWeight:800,color:t.text}}>{d.a}</h2><div style={{fontSize:36,fontWeight:800,color:gc(gr(d.sc2)),marginBottom:16}}>{gr(d.sc2)}</div>
          <div style={{fontSize:14,color:t.textMid,lineHeight:2}}><div>Electricity: <b>{d.e}¢/kWh</b></div><div>Gas: <b>${d.g}/gal</b></div><div>Solar: <b>{d.s} sun-hrs/day</b></div><div>Climate: <b>{d.z}</b></div><div>EV incentive: <b>{d.ec>0?`$${d.ec.toLocaleString()}`:"None"}</b></div><div>Solar credit: <b>{d.sc>0?`$${d.sc.toLocaleString()}`:"None"}</b></div><div>Net metering: <b>{d.nm}</b></div><div>Grid renewable: <b>{d.gc}%</b></div></div>
        </div>}
      </div>
    </div>
  );
}

// ─── HOME PAGE ───
function HomePage({navigate,t}){
  const[heroZip,setHeroZip]=useState("");
  return(
    <div>
      <section style={{padding:"clamp(48px,10vw,100px) 0 clamp(40px,8vw,72px)"}}>
        <div style={{maxWidth:660}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:t.greenLight,borderRadius:100,padding:"5px 14px",marginBottom:24}}>
            <span style={{fontSize:14}}>🌱</span><span style={{fontSize:13,fontWeight:600,color:t.greenDark}}>Independent & Unbiased</span>
          </div>
          <h1 style={{fontSize:"clamp(32px,5.5vw,52px)",fontWeight:800,lineHeight:1.1,color:t.text,letterSpacing:"-0.03em"}}>Energy decisions are<br/>expensive. Get them right.</h1>
          <p style={{fontSize:"clamp(16px,2vw,19px)",color:t.textMid,lineHeight:1.65,marginTop:20,maxWidth:500}}>Real calculators with real data. Every assumption visible. Every number computed, not guessed.</p>
          <div style={{display:"flex",gap:10,marginTop:28,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",border:`1.5px solid ${t.border}`,borderRadius:12,background:t.white,overflow:"hidden"}}>
              <span style={{paddingLeft:14,color:t.textLight,fontSize:14}}>📍</span>
              <input value={heroZip} onChange={e=>setHeroZip(e.target.value)} placeholder="Your ZIP code" style={{border:"none",outline:"none",padding:"13px 12px",fontSize:15,background:"transparent",color:t.text,width:130}}/>
            </div>
            <button onClick={()=>navigate("ev")} style={{background:t.green,color:"#fff",border:"none",borderRadius:12,padding:"13px 24px",fontSize:15,fontWeight:700,cursor:"pointer",transition:"transform .15s"}}>Run EV Savings →</button>
            <button onClick={()=>navigate("solar")} style={{background:"transparent",color:t.text,border:`1.5px solid ${t.border}`,borderRadius:12,padding:"13px 24px",fontSize:15,fontWeight:600,cursor:"pointer"}}>Solar ROI →</button>
          </div>
        </div>
      </section>

      <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:16,paddingBottom:48,borderBottom:`1px solid ${t.border}`}}>
        {[{n:50,s:" states",l:"Full coverage"},{n:12847,s:"",l:"ZIP codes modeled",p:true},{n:850,s:"+",l:"Utility rates tracked"},{n:6,s:"",l:"Real calculators"}].map((s,i)=>(
          <div key={i} style={{textAlign:"center",padding:16}}>
            <div style={{fontSize:28}}><AnimCount end={s.n} suffix={s.s} t={t} duration={1400}/></div>
            <div style={{fontSize:12,color:t.textLight,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </section>

      <section style={{padding:"48px 0",borderBottom:`1px solid ${t.border}`}}>
        <div style={{fontSize:13,fontWeight:600,color:t.green,letterSpacing:".06em",textTransform:"uppercase",marginBottom:10}}>What We Build</div>
        <h2 style={{fontSize:"clamp(22px,3.5vw,30px)",fontWeight:800,color:t.text,marginBottom:28}}>Tools that actually compute things</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
          {[
            {icon:"⚡",title:"EV Savings Calculator",desc:"ZIP-based electricity & gas, real vehicle data, climate adjustments, every incentive. All assumptions visible.",cta:"ev"},
            {icon:"☀️",title:"Solar ROI Calculator",desc:"Your roof, your rates, your sun. Production ranges, payback periods, 25-year projections.",cta:"solar"},
            {icon:"🛒",title:"Gear Reviews",desc:"Solar panels & battery packs reviewed from real owner data. Honest pros, cons, and quirks.",cta:"marketplace"},
            {icon:"🗺️",title:"State Report Cards",desc:"50 states graded on grid, incentives, solar policy, and utility friendliness.",cta:"states"},
          ].map((tool,i)=>(
            <div key={i} onClick={()=>navigate(tool.cta)} style={{padding:24,border:`1px solid ${t.borderLight}`,borderRadius:14,cursor:"pointer",background:t.white,transition:"all .2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=t.green+"66"}
              onMouseLeave={e=>e.currentTarget.style.borderColor=t.borderLight}>
              <div style={{fontSize:28,marginBottom:10}}>{tool.icon}</div>
              <h3 style={{fontSize:16,fontWeight:700,color:t.text,marginBottom:6}}>{tool.title}</h3>
              <p style={{fontSize:13,color:t.textMid,lineHeight:1.6}}>{tool.desc}</p>
              <div style={{marginTop:10,fontSize:13,fontWeight:600,color:t.green}}>Open →</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{padding:"48px 0",borderBottom:`1px solid ${t.border}`}}>
        <h2 style={{fontSize:20,fontWeight:700,color:t.text,marginBottom:20}}>How this is different</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14}}>
          {[{t:"No national averages",d:"Your ZIP drives everything — electricity, gas, climate, incentives."},{t:"Every assumption shown",d:"Click 'Show assumptions' on any result. Override anything."},{t:"No fake precision",d:"Ranges and confidence levels. When we estimate, we say so."},{t:"Affiliate-transparent",d:"Product links may earn commission. It never influences ratings."}].map((item,i)=>(
            <div key={i} style={{padding:18,background:t.card,borderRadius:12}}>
              <h4 style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:4}}>{item.t}</h4>
              <p style={{fontSize:13,color:t.textMid,lineHeight:1.5}}>{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{padding:"48px 0"}}>
        <h2 style={{fontSize:20,fontWeight:700,color:t.text,marginBottom:20}}>Quick Picks</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
          {[SOLAR_PANELS[0],POWER_STATIONS[0],SOLAR_PANELS[2]].map(p=>(
            <div key={p.id+p.name} onClick={()=>navigate("marketplace")} style={{padding:20,background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,cursor:"pointer"}}>
              <div style={{fontSize:11,fontWeight:600,color:t.textLight,textTransform:"uppercase"}}>{p.brand}</div>
              <div style={{fontSize:15,fontWeight:700,color:t.text,marginTop:4}}>{p.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}><Stars n={p.rating} T={t}/><span style={{fontSize:12,color:t.textLight}}>${p.price}</span></div>
              <div style={{display:"flex",gap:4,marginTop:8}}>{p.tags?.slice(0,2).map(tag=><Badge key={tag} type="tag" t={t}>{tag}</Badge>)}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{background:t.text,margin:"0 -48px",padding:"36px 48px",borderRadius:16,textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:"clamp(18px,3vw,26px)",fontWeight:700,color:t.bg}}>Start with your ZIP code.</div>
        <div style={{fontSize:14,color:t.textLight,marginTop:6,marginBottom:20}}>Free. No signup. No sales pitch.</div>
        <button onClick={()=>navigate("ev")} style={{background:t.green,color:"#fff",border:"none",borderRadius:12,padding:"14px 28px",fontSize:15,fontWeight:700,cursor:"pointer"}}>Run the Numbers →</button>
      </div>
      <div style={{textAlign:"center",padding:"16px 0",fontSize:16,fontWeight:700,fontStyle:"italic",color:t.textLight}}>Don't be wasteful. Be <span style={{color:t.green}}>Wattfull</span>.</div>
    </div>
  );
}

// ─── MAIN APP ───
export default function App(){
  const[dark,setDark]=useState(false);
  const[dimming,setDimming]=useState(false);
  const[page,setPage]=useState("home");
  const[menuOpen,setMenuOpen]=useState(false);
  const[scrolled,setScrolled]=useState(false);
  const t=dark?themes.dark:themes.light;

  const toggleDark=()=>{setDimming(true);setTimeout(()=>{setDark(!dark);setTimeout(()=>setDimming(false),400)},300)};
  useEffect(()=>{const h=()=>setScrolled(window.scrollY>20);window.addEventListener("scroll",h,{passive:true});return()=>window.removeEventListener("scroll",h)},[]);
  const navigate=useCallback(p=>{setPage(p);setMenuOpen(false);window.scrollTo({top:0,behavior:"instant"})},[]);

  const navItems=[{id:"ev",label:"EV Calculator"},{id:"solar",label:"Solar ROI"},{id:"marketplace",label:"Gear Reviews"},{id:"states",label:"States"},{id:"methodology",label:"How It Works"}];
  const container={maxWidth:1120,margin:"0 auto",padding:"0 clamp(16px,4vw,48px)"};

  return(
    <div style={{fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:t.bg,color:t.text,minHeight:"100vh",transition:"background .5s ease, color .5s ease"}}>
      {dimming&&<div style={{position:"fixed",inset:0,background:"#000",zIndex:9999,animation:"dimFade .7s ease",pointerEvents:"none"}}/>}

      <nav style={{position:"sticky",top:0,zIndex:100,transition:"all .25s",background:scrolled?t.navBg:"transparent",backdropFilter:scrolled?"blur(16px)":"none",borderBottom:scrolled?`1px solid ${t.borderLight}`:"1px solid transparent"}}>
        <div style={{...container,display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>navigate("home")} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,fontWeight:800,color:t.text,letterSpacing:"-.02em",padding:0,display:"flex",alignItems:"center",gap:7}}>⚡ Wattfull</button>
            <button onClick={toggleDark} aria-label="Toggle dark mode" style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:20,width:40,height:24,position:"relative",cursor:"pointer",transition:"all .3s",display:"flex",alignItems:"center"}}>
              <div style={{width:18,height:18,borderRadius:9,background:dark?t.green:"#F0C040",position:"absolute",transition:"all .4s cubic-bezier(.68,-.55,.27,1.55)",left:dark?19:3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,boxShadow:dark?`0 0 8px ${t.green}60`:"0 0 8px #F0C04060"}}>{dark?"🌙":"☀️"}</div>
            </button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            {navItems.map(n=><button key={n.id} onClick={()=>navigate(n.id)} className="nav-d" style={{background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:page===n.id?700:500,color:page===n.id?t.green:t.textMid,padding:0,transition:"color .15s"}}>{n.label}</button>)}
            <button onClick={()=>setMenuOpen(!menuOpen)} className="nav-m" style={{background:"none",border:"none",cursor:"pointer",color:t.text,padding:4,fontSize:20}}>{menuOpen?"✕":"☰"}</button>
          </div>
        </div>
        {menuOpen&&<div style={{...container,paddingBottom:16,background:t.bg}}>{navItems.map(n=><button key={n.id} onClick={()=>navigate(n.id)} style={{display:"block",width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:`1px solid ${t.borderLight}`,padding:"14px 0",fontSize:16,fontWeight:600,color:t.text,cursor:"pointer"}}>{n.label}</button>)}</div>}
      </nav>

      <main style={{...container,paddingTop:24,paddingBottom:48}}>
        {page==="home"&&<HomePage navigate={navigate} t={t}/>}
        {page==="ev"&&<EVCalcPage t={t}/>}
        {page==="solar"&&<SolarCalcPage t={t}/>}
        {page==="marketplace"&&<MarketplacePage t={t}/>}
        {page==="states"&&<StatesPage t={t}/>}
        {page==="methodology"&&<MethodologyPage t={t}/>}
      </main>

      <footer style={{borderTop:`1px solid ${t.border}`,padding:"20px 0",transition:"all .5s"}}>
        <div style={{...container,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{fontSize:12,color:t.textLight}}>© 2026 Wattfull · Sources: EIA, NREL, EPA, DSIRE, AAA · <button onClick={()=>navigate("methodology")} style={{background:"none",border:"none",color:t.green,cursor:"pointer",fontSize:12,fontWeight:600,padding:0}}>Full methodology</button></div>
          <div style={{fontSize:12,color:t.textFaint}}>Estimates only. Not financial advice.</div>
        </div>
      </footer>

      <style>{`
        *{box-sizing:border-box;margin:0}
        ::selection{background:${t.greenLight};color:${t.greenDark}}
        input::placeholder{color:${t.textFaint}}
        html{scroll-behavior:smooth}
        input[type=range]{height:6px}
        .nav-d{display:flex}.nav-m{display:none}
        @media(max-width:768px){
          .nav-d{display:none !important}.nav-m{display:flex !important}
          .detail-col{display:none !important}
        }
        @keyframes dimFade{0%{opacity:0}35%{opacity:.85}65%{opacity:.85}100%{opacity:0}}
        @media(prefers-reduced-motion:reduce){*{animation:none !important;transition-duration:0s !important}}
      `}</style>
    </div>
  );
}

// ─── SOLAR CALC PAGE ───
function SolarCalcPage({t}){
  const[zip,setZip]=useState("");const[st,setSt]=useState(null);const[sd,setSd2]=useState(null);const[kwh,setKwh]=useState(900);const[roof,setRoof]=useState(400);const[shade,setShade]=useState("light");const[orient,setOrient]=useState("south");const[cpw,setCpw]=useState(2.85);const[fed,setFed]=useState(true);const[stC,setStC]=useState(true);const[rateEsc,setRateEsc]=useState(3);const[res,setRes]=useState(null);
  useEffect(()=>{if(zip.length===5){const s=zipToState(zip);setSt(s);setSd2(s?SD[s]:null)}else{setSt(null);setSd2(null)}},[zip]);
  const calc=()=>{
    if(!/^\d{5}$/.test(zip)||!st)return;
    const d=sd,sh={none:1,light:.9,moderate:.75,heavy:.55}[shade],or={south:1,sw_se:.92,ew:.82,north:.65}[orient];
    const maxP=Math.floor(roof/18),annUse=kwh*12,tKw=Math.min(annUse/(d.s*365*sh*or*.82),maxP*400/1000);
    const sysKw=Math.round(tKw*10)/10,sysCost=sysKw*1000*cpw;
    const prod=sysKw*d.s*365*sh*or*.82;let itc=0;if(fed)itc+=sysCost*.3;if(stC)itc+=d.sc||0;const net=sysCost-itc;
    const yd=[];let cum=0,pb=null;
    for(let y=0;y<=25;y++){const deg=1-y*.005,rate=d.e*Math.pow(1+rateEsc/100,y)/100,yp=prod*deg,ys=y===0?0:yp*rate;cum+=ys;if(!pb&&cum>net&&y>0)pb=y;yd.push({year:y,savings:Math.round(cum),cost:Math.round(net)})}
    setRes({sysKw,sysCost:Math.round(sysCost),net:Math.round(net),itc:Math.round(itc),prodLow:Math.round(prod*.85),prodMed:Math.round(prod),prodHigh:Math.round(prod*1.1),pb,lifetime:Math.round(cum-net),yd,offset:Math.min(100,Math.round(prod/annUse*100))});
  };
  return(
    <div>
      <h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>Solar ROI Calculator</h1>
      <p style={{fontSize:16,color:t.textMid,lineHeight:1.6,marginTop:8,maxWidth:600}}>Estimate payback and lifetime savings using your location's solar resource, rates, and incentives.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:28,marginTop:28}}>
        <div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:22}}>
          <Input label="ZIP Code" value={zip} onChange={setZip} t={t}/>
          {st&&sd&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}><Badge type="real" t={t}>{st}</Badge><Badge type="estimated" t={t}>{sd.s} sun-hrs</Badge><Badge type="estimated" t={t}>{sd.e}¢/kWh</Badge></div>}
          <Slider label="Monthly kWh Usage" value={kwh} onChange={setKwh} min={200} max={3000} step={50} suffix=" kWh" t={t}/>
          <Slider label="Usable Roof (sqft)" value={roof} onChange={setRoof} min={100} max={1500} step={25} suffix=" sqft" t={t}/>
          <Select label="Shading" value={shade} onChange={setShade} t={t} options={[{value:"none",label:"None (full sun)"},{value:"light",label:"Light"},{value:"moderate",label:"Moderate"},{value:"heavy",label:"Heavy"}]}/>
          <Select label="Orientation" value={orient} onChange={setOrient} t={t} options={[{value:"south",label:"South (optimal)"},{value:"sw_se",label:"SW / SE"},{value:"ew",label:"East / West"},{value:"north",label:"North (poor)"}]}/>
          <Input label="Cost/Watt" type="number" value={cpw} onChange={setCpw} prefix="$" suffix="/W" step={.05} t={t}/>
          <Toggle label="30% Federal ITC" value={fed} onChange={setFed} t={t}/>
          <Toggle label="State credits" value={stC} onChange={setStC} t={t} tip={`${st||"State"}: $${sd?.sc?.toLocaleString()||0}`}/>
          <Slider label="Rate escalation" value={rateEsc} onChange={setRateEsc} min={0} max={6} step={.5} suffix="%/yr" t={t}/>
          <button onClick={calc} style={{width:"100%",background:t.green,color:"#fff",border:"none",borderRadius:12,padding:"14px 0",fontSize:15,fontWeight:700,cursor:"pointer",marginTop:8,opacity:zip.length===5?1:.5}}>Calculate Solar ROI</button>
        </div>
        <div>
          {!res?<div style={{background:t.card,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:40,textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>☀️</div><h3 style={{fontSize:18,fontWeight:700,color:t.text}}>Enter details & Calculate</h3></div>:(
            <div>
              <div style={{background:t.green,borderRadius:14,padding:22,color:"#fff",marginBottom:16}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div><div style={{fontSize:11,opacity:.7}}>System</div><div style={{fontSize:22,fontWeight:800}}>{res.sysKw} kW</div></div>
                  <div><div style={{fontSize:11,opacity:.7}}>Net Cost</div><div style={{fontSize:22,fontWeight:800}}>${res.net.toLocaleString()}</div></div>
                  <div><div style={{fontSize:11,opacity:.7}}>Payback</div><div style={{fontSize:22,fontWeight:800}}>~{res.pb||"—"} yrs</div></div>
                  <div><div style={{fontSize:11,opacity:.7}}>25-Yr Savings</div><div style={{fontSize:22,fontWeight:800}}>${res.lifetime.toLocaleString()}</div></div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
                  <div style={{padding:"5px 10px",background:"rgba(255,255,255,.15)",borderRadius:6,fontSize:12}}>{res.prodLow.toLocaleString()}–{res.prodHigh.toLocaleString()} kWh/yr</div>
                  <div style={{padding:"5px 10px",background:"rgba(255,255,255,.15)",borderRadius:6,fontSize:12}}>~{res.offset}% offset</div>
                </div>
              </div>
              <div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:18,marginBottom:16}}>
                <div style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:14}}>Savings vs. Cost</div>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={res.yd}><defs><linearGradient id="sG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.green} stopOpacity={.12}/><stop offset="95%" stopColor={t.green} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/><XAxis dataKey="year" tick={{fontSize:11,fill:t.textLight}} axisLine={false} tickLine={false} tickFormatter={v=>`Yr ${v}`}/><YAxis tick={{fontSize:11,fill:t.textLight}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v)}/><Tooltip content={p=><ChartTip {...p} prefix="$" t={t}/>}/><Line type="monotone" dataKey="cost" stroke={t.textLight} strokeWidth={2} strokeDasharray="5 4" dot={false} name="Net Cost"/><Area type="monotone" dataKey="savings" stroke={t.green} strokeWidth={2.5} fill="url(#sG)" name="Savings"/></AreaChart></ResponsiveContainer>
              </div>
              <div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:18}}>
                <div style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:8}}>Cost Breakdown</div>
                <div style={{fontSize:13,color:t.textMid,lineHeight:2}}>
                  <div>Gross: <b>${res.sysCost.toLocaleString()}</b></div>
                  <div>Federal ITC: <b>−${(fed?Math.round(res.sysCost*.3):0).toLocaleString()}</b></div>
                  <div>State: <b>−${(stC?(sd?.sc||0):0).toLocaleString()}</b></div>
                  <div style={{fontWeight:700,color:t.text}}>Net: ${res.net.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── METHODOLOGY PAGE ───
function MethodologyPage({t}){
  return(
    <div style={{maxWidth:720}}>
      <h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text,marginBottom:20}}>Methodology & Data Sources</h1>
      <p style={{fontSize:16,color:t.textMid,lineHeight:1.7,marginBottom:28}}>Every number is computed from defined formulas with stated inputs. Here's how everything works.</p>
      {[
        {title:"EV Savings",items:["EV fuel = (kWh/mi × miles) × blended electricity cost × (1 + loss)","Blended cost = (home% × rate × 1.12) + (public% × (rate+$0.18) × 1.06) + (DCFC% × $0.35)","ICE fuel = (miles ÷ MPG) × gas price","EV maintenance: $0.065/mi · ICE: $0.10/mi (configurable)","Climate penalty: cold +22%, mild +5%, warm +3%, hot +4%","Charging loss: 12% home L2 · Sensitivity: ±20% energy prices"]},
        {title:"Solar ROI",items:["Production = kW × sun-hrs × 365 × shade × orientation × 0.82","System efficiency 82%: inverter 3%, wiring 2%, soiling 3%, mismatch 2%, temp 8%","Degradation: 0.5%/year · Rate escalation: default 3%/yr","Federal ITC: 30% through 2032 · Sizing: 400W panels, 18 sqft each","Cost/watt: $2.85 national avg (SEIA/Wood Mackenzie)"]},
        {title:"Data Sources",items:["Electricity: EIA State Profiles (residential avg, quarterly)","Gas: AAA state averages (monthly)","Vehicles: EPA fueleconomy.gov ratings","Solar: NREL PVWatts state averages","Incentives: DSIRE + IRS guidance","Climate: ASHRAE zone mapping (simplified to 4 zones)"]},
        {title:"What's Estimated vs. Real",items:["ESTIMATED: State-avg electricity, gas, climate penalty, maintenance, solar irradiance","USER-PROVIDED: ZIP, mileage, vehicle, charging behavior, roof specs","VERIFIED: EPA ratings, federal credits, ITC %, degradation rates","NOT INCLUDED: Depreciation, TOU rates, demand charges, battery replacement"]},
        {title:"Product Reviews",items:["Solar panel and power station assessments synthesize reviews from multiple sources","We aggregate owner reviews from Amazon, independent testing labs, and enthusiast forums","Ratings reflect consensus across sources, not any single reviewer","Affiliate links are disclosed. Affiliate relationships do not influence ratings","'Editor's Pick' reflects our assessment of best value in category, not sponsor preference"]}
      ].map((sec,i)=>(
        <div key={i} style={{marginBottom:28}}>
          <h2 style={{fontSize:18,fontWeight:700,color:t.text,marginBottom:10}}>{sec.title}</h2>
          <div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:18}}>
            {sec.items.map((line,j)=><p key={j} style={{fontSize:13,color:t.textMid,lineHeight:1.7,marginBottom:j<sec.items.length-1?10:0,...(line.startsWith("EV ")||line.startsWith("ICE ")||line.startsWith("Blended")||line.startsWith("Production")||line.startsWith("System")||line.startsWith("ESTIMATED")||line.startsWith("USER")||line.startsWith("VERIFIED")||line.startsWith("NOT ")?{fontFamily:"monospace",fontSize:12,background:t.card,padding:"6px 10px",borderRadius:6}:{})}}>{line}</p>)}
          </div>
        </div>
      ))}
    </div>
  );
}
