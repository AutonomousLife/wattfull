"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

// ─── THEME ───
const T={
  light:{bg:"#FAFAF8",bg2:"#F4F3F0",white:"#FFFFFF",card:"#F6F5F2",text:"#1E1E1E",textMid:"#4A4A4A",textLight:"#7A7A7A",textFaint:"#A8A8A8",green:"#4A7C59",greenLight:"#E6EFE9",greenDark:"#2F5A3C",border:"#E5E3DE",borderLight:"#EEEDEA",warn:"#C97B2A",warnBg:"#FFF8EF",err:"#B5403A",errBg:"#FFF0EF",blue:"#4A6FA5",blueBg:"#EEF3FA",star:"#D4A017",navBg:"rgba(250,250,248,.95)",shadow:"rgba(0,0,0,.06)",accent:"#E8B830"},
  dark:{bg:"#111113",bg2:"#1A1A1E",white:"#1E1E22",card:"#232328",text:"#E8E8EC",textMid:"#A0A0A8",textLight:"#6E6E78",textFaint:"#4A4A52",green:"#6AAF7B",greenLight:"#1A2E20",greenDark:"#8CD49A",border:"#2A2A30",borderLight:"#222228",warn:"#E0993A",warnBg:"#2A2218",err:"#E06060",errBg:"#2A1A1A",blue:"#6A9FD5",blueBg:"#1A2230",star:"#E8B830",navBg:"rgba(17,17,19,.92)",shadow:"rgba(0,0,0,.3)",accent:"#E8B830"}
};

// ─── DATA ───
const ZM={"010":"MA","011":"MA","012":"MA","013":"MA","014":"MA","015":"MA","016":"MA","017":"MA","018":"MA","019":"MA","020":"MA","021":"MA","022":"MA","023":"MA","024":"MA","025":"MA","026":"MA","027":"MA","028":"RI","029":"RI","030":"NH","031":"NH","032":"NH","033":"NH","034":"NH","035":"VT","036":"VT","037":"VT","038":"VT","039":"ME","040":"ME","041":"ME","042":"ME","043":"ME","044":"ME","045":"ME","046":"ME","047":"ME","048":"ME","049":"ME","050":"VT","051":"VT","052":"VT","053":"VT","054":"VT","055":"MA","056":"VT","057":"VT","058":"VT","059":"VT","060":"CT","061":"CT","062":"CT","063":"CT","064":"CT","065":"CT","066":"CT","067":"CT","068":"CT","069":"CT","070":"NJ","071":"NJ","072":"NJ","073":"NJ","074":"NJ","075":"NJ","076":"NJ","077":"NJ","078":"NJ","079":"NJ","080":"NJ","081":"NJ","082":"NJ","083":"NJ","084":"NJ","085":"NJ","086":"NJ","087":"NJ","088":"NJ","089":"NJ","100":"NY","101":"NY","102":"NY","103":"NY","104":"NY","105":"NY","106":"NY","107":"NY","108":"NY","109":"NY","110":"NY","111":"NY","112":"NY","113":"NY","114":"NY","115":"NY","116":"NY","117":"NY","118":"NY","119":"NY","120":"NY","121":"NY","122":"NY","123":"NY","124":"NY","125":"NY","126":"NY","127":"NY","128":"NY","129":"NY","130":"NY","131":"NY","132":"NY","133":"NY","134":"NY","135":"NY","136":"NY","137":"NY","138":"NY","139":"NY","140":"NY","141":"NY","142":"NY","143":"NY","144":"NY","145":"NY","146":"NY","147":"NY","148":"NY","149":"NY","150":"PA","151":"PA","152":"PA","153":"PA","154":"PA","155":"PA","156":"PA","157":"PA","158":"PA","159":"PA","160":"PA","161":"PA","162":"PA","163":"PA","164":"PA","165":"PA","166":"PA","167":"PA","168":"PA","169":"PA","170":"PA","171":"PA","172":"PA","173":"PA","174":"PA","175":"PA","176":"PA","177":"PA","178":"PA","179":"PA","180":"PA","181":"PA","182":"PA","183":"PA","184":"PA","185":"PA","186":"PA","187":"PA","188":"PA","189":"PA","190":"PA","191":"PA","192":"PA","193":"PA","194":"PA","195":"PA","196":"PA","197":"DE","198":"DE","199":"DE","200":"VA","201":"VA","202":"DC","203":"DC","204":"DC","206":"MD","207":"MD","208":"MD","209":"MD","210":"MD","211":"MD","212":"MD","214":"MD","215":"MD","216":"MD","220":"VA","221":"VA","222":"VA","223":"VA","224":"VA","225":"VA","226":"VA","227":"VA","228":"VA","229":"VA","230":"VA","231":"VA","232":"VA","233":"VA","234":"VA","235":"VA","236":"VA","237":"VA","238":"VA","239":"VA","240":"VA","241":"VA","242":"VA","243":"VA","244":"VA","245":"VA","246":"VA","247":"WV","248":"WV","249":"WV","250":"WV","251":"WV","252":"WV","253":"WV","254":"WV","255":"WV","256":"WV","257":"WV","258":"WV","259":"WV","260":"WV","261":"WV","262":"WV","263":"WV","264":"WV","265":"WV","266":"WV","267":"WV","268":"WV","270":"NC","271":"NC","272":"NC","273":"NC","274":"NC","275":"NC","276":"NC","277":"NC","278":"NC","279":"NC","280":"NC","281":"NC","282":"NC","283":"NC","284":"NC","285":"NC","286":"NC","287":"NC","288":"NC","289":"NC","290":"SC","291":"SC","292":"SC","293":"SC","294":"SC","295":"SC","296":"SC","297":"SC","298":"SC","299":"SC","300":"GA","301":"GA","302":"GA","303":"GA","304":"GA","305":"GA","306":"GA","307":"GA","308":"GA","309":"GA","310":"GA","311":"GA","312":"GA","313":"GA","314":"GA","315":"GA","316":"GA","317":"GA","318":"GA","319":"GA","320":"FL","321":"FL","322":"FL","323":"FL","324":"FL","325":"FL","326":"FL","327":"FL","328":"FL","329":"FL","330":"FL","331":"FL","332":"FL","333":"FL","334":"FL","335":"FL","336":"FL","337":"FL","338":"FL","339":"FL","340":"FL","341":"FL","342":"FL","344":"FL","346":"FL","347":"FL","349":"FL","350":"AL","351":"AL","352":"AL","354":"AL","355":"AL","356":"AL","357":"AL","358":"AL","359":"AL","360":"AL","361":"AL","362":"AL","363":"AL","364":"AL","365":"AL","366":"AL","367":"AL","368":"AL","369":"AL","370":"TN","371":"TN","372":"TN","373":"TN","374":"TN","375":"TN","376":"TN","377":"TN","378":"TN","379":"TN","380":"TN","381":"TN","382":"TN","383":"TN","384":"TN","385":"TN","386":"MS","387":"MS","388":"MS","389":"MS","390":"MS","391":"MS","392":"MS","393":"MS","394":"MS","395":"MS","396":"MS","397":"MS","400":"KY","401":"KY","402":"KY","403":"KY","404":"KY","405":"KY","406":"KY","407":"KY","408":"KY","409":"KY","410":"KY","411":"KY","412":"KY","413":"KY","414":"KY","415":"KY","416":"KY","417":"KY","418":"KY","420":"KY","421":"KY","422":"KY","423":"KY","424":"KY","425":"KY","426":"KY","427":"KY","430":"OH","431":"OH","432":"OH","433":"OH","434":"OH","435":"OH","436":"OH","437":"OH","438":"OH","439":"OH","440":"OH","441":"OH","442":"OH","443":"OH","444":"OH","445":"OH","446":"OH","447":"OH","448":"OH","449":"OH","450":"OH","451":"OH","452":"OH","453":"OH","454":"OH","455":"OH","456":"OH","457":"OH","458":"OH","459":"OH","460":"IN","461":"IN","462":"IN","463":"IN","464":"IN","465":"IN","466":"IN","467":"IN","468":"IN","469":"IN","470":"IN","471":"IN","472":"IN","473":"IN","474":"IN","475":"IN","476":"IN","477":"IN","478":"IN","479":"IN","480":"MI","481":"MI","482":"MI","483":"MI","484":"MI","485":"MI","486":"MI","487":"MI","488":"MI","489":"MI","490":"MI","491":"MI","492":"MI","493":"MI","494":"MI","495":"MI","496":"MI","497":"MI","498":"MI","499":"MI","500":"IA","501":"IA","502":"IA","503":"IA","504":"IA","505":"IA","506":"IA","507":"IA","508":"IA","509":"IA","510":"IA","511":"IA","512":"IA","513":"IA","514":"IA","515":"IA","516":"IA","520":"IA","521":"IA","522":"IA","523":"IA","524":"IA","525":"IA","526":"IA","527":"IA","528":"IA","530":"WI","531":"WI","532":"WI","534":"WI","535":"WI","537":"WI","538":"WI","539":"WI","540":"WI","541":"WI","542":"WI","543":"WI","544":"WI","545":"WI","546":"WI","547":"WI","548":"WI","549":"WI","550":"MN","551":"MN","553":"MN","554":"MN","555":"MN","556":"MN","557":"MN","558":"MN","559":"MN","560":"MN","561":"MN","562":"MN","563":"MN","564":"MN","565":"MN","566":"MN","567":"MN","570":"SD","571":"SD","572":"SD","573":"SD","574":"SD","575":"SD","576":"SD","577":"SD","580":"ND","581":"ND","582":"ND","583":"ND","584":"ND","585":"ND","586":"ND","587":"ND","588":"ND","590":"MT","591":"MT","592":"MT","593":"MT","594":"MT","595":"MT","596":"MT","597":"MT","598":"MT","599":"MT","600":"IL","601":"IL","602":"IL","603":"IL","604":"IL","605":"IL","606":"IL","607":"IL","608":"IL","609":"IL","610":"IL","611":"IL","612":"IL","613":"IL","614":"IL","615":"IL","616":"IL","617":"IL","618":"IL","619":"IL","620":"IL","622":"IL","623":"IL","624":"IL","625":"IL","626":"IL","627":"IL","628":"IL","629":"IL","630":"MO","631":"MO","633":"MO","634":"MO","635":"MO","636":"MO","637":"MO","638":"MO","639":"MO","640":"MO","641":"MO","644":"MO","645":"MO","646":"MO","647":"MO","648":"MO","649":"MO","650":"MO","651":"MO","652":"MO","653":"MO","654":"MO","655":"MO","656":"MO","657":"MO","658":"MO","660":"KS","661":"KS","662":"KS","664":"KS","665":"KS","666":"KS","667":"KS","668":"KS","669":"KS","670":"KS","671":"KS","672":"KS","673":"KS","674":"KS","675":"KS","676":"KS","677":"KS","678":"KS","679":"KS","680":"NE","681":"NE","683":"NE","684":"NE","685":"NE","686":"NE","687":"NE","688":"NE","689":"NE","690":"NE","691":"NE","692":"NE","693":"NE","700":"LA","701":"LA","703":"LA","704":"LA","705":"LA","706":"LA","707":"LA","708":"LA","710":"LA","711":"LA","712":"LA","713":"LA","714":"LA","716":"AR","717":"AR","718":"AR","719":"AR","720":"AR","721":"AR","722":"AR","723":"AR","724":"AR","725":"AR","726":"AR","727":"AR","728":"AR","729":"AR","730":"OK","731":"OK","734":"OK","735":"OK","736":"OK","737":"OK","738":"OK","739":"OK","740":"OK","741":"OK","743":"OK","744":"OK","745":"OK","746":"OK","747":"OK","748":"OK","749":"OK","750":"TX","751":"TX","752":"TX","753":"TX","754":"TX","755":"TX","756":"TX","757":"TX","758":"TX","759":"TX","760":"TX","761":"TX","762":"TX","763":"TX","764":"TX","765":"TX","766":"TX","767":"TX","768":"TX","769":"TX","770":"TX","771":"TX","772":"TX","773":"TX","774":"TX","775":"TX","776":"TX","777":"TX","778":"TX","779":"TX","780":"TX","781":"TX","782":"TX","783":"TX","784":"TX","785":"TX","786":"TX","787":"TX","788":"TX","789":"TX","790":"TX","791":"TX","792":"TX","793":"TX","794":"TX","795":"TX","796":"TX","797":"TX","798":"TX","799":"TX","800":"CO","801":"CO","802":"CO","803":"CO","804":"CO","805":"CO","806":"CO","807":"CO","808":"CO","809":"CO","810":"CO","811":"CO","812":"CO","813":"CO","814":"CO","815":"CO","816":"CO","820":"WY","821":"WY","822":"WY","823":"WY","824":"WY","825":"WY","826":"WY","827":"WY","828":"WY","829":"WY","830":"WY","831":"WY","832":"ID","833":"ID","834":"ID","835":"ID","836":"ID","837":"ID","838":"ID","840":"UT","841":"UT","842":"UT","843":"UT","844":"UT","845":"UT","846":"UT","847":"UT","850":"AZ","851":"AZ","852":"AZ","853":"AZ","855":"AZ","856":"AZ","857":"AZ","859":"AZ","860":"AZ","863":"AZ","864":"AZ","865":"AZ","870":"NM","871":"NM","872":"NM","873":"NM","874":"NM","875":"NM","877":"NM","878":"NM","879":"NM","880":"TX","881":"TX","882":"TX","883":"TX","884":"TX","885":"TX","890":"NV","891":"NV","893":"NV","894":"NV","895":"NV","897":"NV","898":"NV","900":"CA","901":"CA","902":"CA","903":"CA","904":"CA","905":"CA","906":"CA","907":"CA","908":"CA","910":"CA","911":"CA","912":"CA","913":"CA","914":"CA","915":"CA","916":"CA","917":"CA","918":"CA","919":"CA","920":"CA","921":"CA","922":"CA","923":"CA","924":"CA","925":"CA","926":"CA","927":"CA","928":"CA","930":"CA","931":"CA","932":"CA","933":"CA","934":"CA","935":"CA","936":"CA","937":"CA","938":"CA","939":"CA","940":"CA","941":"CA","942":"CA","943":"CA","944":"CA","945":"CA","946":"CA","947":"CA","948":"CA","949":"CA","950":"CA","951":"CA","952":"CA","953":"CA","954":"CA","955":"CA","956":"CA","957":"CA","958":"CA","959":"CA","960":"CA","961":"CA","970":"OR","971":"OR","972":"OR","973":"OR","974":"OR","975":"OR","976":"OR","977":"OR","978":"OR","979":"OR","980":"WA","981":"WA","982":"WA","983":"WA","984":"WA","985":"WA","986":"WA","988":"WA","989":"WA","990":"WA","991":"WA","992":"WA","993":"WA","994":"WA","995":"AK","996":"AK","997":"AK","998":"AK","999":"AK"};
function zipToState(z){return ZM[z?.substring(0,3)]||null}

const SD={AL:{e:13.86,g:2.89,s:4.8,z:"hot",ec:0,sc:0,nm:"partial",gc:28},AK:{e:24.21,g:3.82,s:2.8,z:"cold",ec:0,sc:0,nm:"none",gc:35},AZ:{e:13.62,g:3.32,s:6.4,z:"hot",ec:0,sc:1000,nm:"partial",gc:38},AR:{e:12.45,g:2.78,s:4.9,z:"warm",ec:0,sc:0,nm:"full",gc:30},CA:{e:27.28,g:4.85,s:5.8,z:"mild",ec:2000,sc:0,nm:"full",gc:52},CO:{e:14.79,g:3.15,s:5.6,z:"cold",ec:2500,sc:0,nm:"full",gc:40},CT:{e:25.63,g:3.25,s:4.2,z:"cold",ec:2250,sc:0,nm:"full",gc:45},DE:{e:14.08,g:3.05,s:4.5,z:"mild",ec:0,sc:0,nm:"full",gc:32},FL:{e:14.17,g:3.18,s:5.5,z:"hot",ec:0,sc:0,nm:"full",gc:30},GA:{e:13.45,g:2.95,s:5.0,z:"hot",ec:0,sc:0,nm:"partial",gc:28},HI:{e:43.18,g:4.65,s:5.5,z:"hot",ec:0,sc:0,nm:"full",gc:35},ID:{e:10.92,g:3.35,s:5.0,z:"cold",ec:0,sc:0,nm:"full",gc:65},IL:{e:15.24,g:3.45,s:4.3,z:"cold",ec:4000,sc:0,nm:"full",gc:38},IN:{e:14.52,g:3.15,s:4.2,z:"cold",ec:0,sc:0,nm:"full",gc:22},IA:{e:14.46,g:3.05,s:4.4,z:"cold",ec:0,sc:0,nm:"full",gc:60},KS:{e:14.11,g:2.85,s:5.0,z:"warm",ec:0,sc:0,nm:"partial",gc:42},KY:{e:12.56,g:2.92,s:4.3,z:"warm",ec:0,sc:0,nm:"none",gc:15},LA:{e:12.09,g:2.82,s:5.0,z:"hot",ec:2500,sc:0,nm:"full",gc:18},ME:{e:21.72,g:3.28,s:4.0,z:"cold",ec:2000,sc:0,nm:"full",gc:72},MD:{e:15.82,g:3.18,s:4.5,z:"mild",ec:3000,sc:0,nm:"full",gc:35},MA:{e:25.46,g:3.22,s:4.2,z:"cold",ec:3500,sc:1000,nm:"full",gc:48},MI:{e:18.35,g:3.15,s:3.8,z:"cold",ec:0,sc:0,nm:"partial",gc:28},MN:{e:14.48,g:3.05,s:4.2,z:"cold",ec:0,sc:0,nm:"full",gc:38},MS:{e:13.12,g:2.75,s:4.8,z:"hot",ec:0,sc:0,nm:"partial",gc:20},MO:{e:13.38,g:2.88,s:4.6,z:"warm",ec:0,sc:0,nm:"full",gc:18},MT:{e:12.45,g:3.25,s:4.8,z:"cold",ec:0,sc:500,nm:"full",gc:55},NE:{e:12.11,g:3.02,s:4.8,z:"cold",ec:0,sc:0,nm:"partial",gc:32},NV:{e:13.15,g:3.85,s:6.2,z:"hot",ec:0,sc:0,nm:"full",gc:35},NH:{e:22.18,g:3.18,s:4.0,z:"cold",ec:0,sc:0,nm:"full",gc:28},NJ:{e:17.96,g:3.12,s:4.4,z:"mild",ec:4000,sc:0,nm:"full",gc:42},NM:{e:14.55,g:3.08,s:6.2,z:"hot",ec:0,sc:0,nm:"full",gc:32},NY:{e:22.58,g:3.35,s:3.9,z:"cold",ec:2000,sc:0,nm:"full",gc:40},NC:{e:12.85,g:2.98,s:5.0,z:"warm",ec:0,sc:0,nm:"full",gc:30},ND:{e:11.85,g:3.08,s:4.5,z:"cold",ec:0,sc:0,nm:"full",gc:42},OH:{e:14.72,g:3.02,s:4.0,z:"cold",ec:0,sc:0,nm:"full",gc:22},OK:{e:12.18,g:2.75,s:5.2,z:"warm",ec:0,sc:0,nm:"full",gc:45},OR:{e:12.45,g:3.68,s:4.2,z:"mild",ec:2500,sc:0,nm:"full",gc:72},PA:{e:16.82,g:3.22,s:4.1,z:"cold",ec:0,sc:0,nm:"full",gc:35},RI:{e:24.85,g:3.18,s:4.2,z:"cold",ec:2500,sc:0,nm:"full",gc:38},SC:{e:14.08,g:2.85,s:5.0,z:"warm",ec:0,sc:0,nm:"full",gc:28},SD:{e:13.02,g:3.05,s:4.8,z:"cold",ec:0,sc:0,nm:"partial",gc:40},TN:{e:12.48,g:2.82,s:4.7,z:"warm",ec:0,sc:0,nm:"partial",gc:22},TX:{e:13.95,g:2.72,s:5.5,z:"hot",ec:0,sc:0,nm:"partial",gc:32},UT:{e:11.58,g:3.28,s:5.8,z:"cold",ec:0,sc:0,nm:"full",gc:25},VT:{e:20.15,g:3.25,s:3.8,z:"cold",ec:4000,sc:0,nm:"full",gc:100},VA:{e:13.52,g:3.02,s:4.6,z:"mild",ec:0,sc:0,nm:"full",gc:32},WA:{e:11.32,g:3.85,s:3.8,z:"mild",ec:0,sc:0,nm:"full",gc:78},WV:{e:12.85,g:2.95,s:4.0,z:"cold",ec:0,sc:0,nm:"none",gc:8},WI:{e:16.12,g:3.08,s:4.0,z:"cold",ec:0,sc:0,nm:"full",gc:22},WY:{e:11.55,g:3.18,s:5.2,z:"cold",ec:0,sc:0,nm:"full",gc:18}};

const VEHICLES={ev:[{id:"model3lr",name:"Tesla Model 3 LR",kwh:25.0,msrp:42490,fc:7500,img:"🚗"},{id:"modely",name:"Tesla Model Y LR",kwh:27.5,msrp:47990,fc:7500,img:"🚙"},{id:"ioniq5",name:"Hyundai Ioniq 5",kwh:29.0,msrp:43800,fc:7500,img:"🚗"},{id:"bolt",name:"Chevy Equinox EV",kwh:30.0,msrp:34995,fc:7500,img:"🚙"},{id:"mache",name:"Ford Mach-E",kwh:32.0,msrp:42995,fc:3750,img:"🚙"},{id:"id4",name:"VW ID.4",kwh:31.0,msrp:39735,fc:7500,img:"🚙"}],ice:[{id:"camry",name:"Toyota Camry",mpg:32,msrp:29495},{id:"civic",name:"Honda Civic",mpg:36,msrp:25945},{id:"rav4",name:"Toyota RAV4",mpg:30,msrp:31380},{id:"crv",name:"Honda CR-V",mpg:30,msrp:31450},{id:"corolla",name:"Toyota Corolla",mpg:35,msrp:23495}]};
const CP={cold:.22,mild:.05,warm:.03,hot:.04};

const SOLAR_PANELS=[
  {id:1,name:"Renogy 200W Portable Suitcase",brand:"Renogy",watts:200,price:259,rating:4.5,reviews:3847,type:"Foldable Monocrystalline",weight:"18.7 lbs",warranty:"5 years",bestFor:"RV & Camping",efficiency:"22.8%",amazonSearch:"Renogy+200W+Portable+Solar+Panel+Suitcase",prosRaw:["Included 20A charge controller saves $40+","Aluminum frame + tempered glass durability","Adjustable kickstand holds in wind","Works with lithium AND lead-acid"],consRaw:["Heavy for hiking — vehicle panel only","MC4 connectors only, need adapter","Suitcase latch can feel cheap"],verdict:"The gold standard for RV and off-grid camping. Included charge controller saves a separate purchase. Not for backpackers at 19 lbs. Reviewers praise 3+ years with no degradation.",quirks:"Soldered fuses hard to replace. Check adapter polarity. Real output 60-75% of rated.",peopleSay:"Output averages 140-160W in sun. Popular with van life. Some complaints about customer service.",tags:["Editor's Pick","Best for RV"]},
  {id:2,name:"Jackery SolarSaga 200W",brand:"Jackery",watts:200,price:499,rating:4.4,reviews:1256,type:"Foldable Monocrystalline",weight:"17.6 lbs",warranty:"3 years",bestFor:"Jackery Ecosystem",efficiency:"24.3%",amazonSearch:"Jackery+SolarSaga+200W",prosRaw:["Plug-and-play with Jackery stations","Higher cell efficiency","IP67 water resistance","Excellent build quality"],consRaw:["Proprietary connector","Nearly double Renogy's price","Shorter 3yr warranty","$25 adapter for non-Jackery"],verdict:"Premium build at premium price. Seamless with Jackery stations. 24.3% efficiency is above average. Think Apple of solar panels.",quirks:"Proprietary Anderson connector. Kickstand less sturdy. 50-65% real output.",peopleSay:"Jackery owners love it. Non-owners feel overcharged. 'I just want it to work' crowd.",tags:["Premium Pick"]},
  {id:3,name:"BigBlue SolarPowa 28W",brand:"BigBlue",watts:28,price:65,rating:4.3,reviews:5621,type:"Foldable Monocrystalline",weight:"1.3 lbs",warranty:"2 years",bestFor:"Phone & Tablet Charging",efficiency:"23.4%",amazonSearch:"BigBlue+28W+Solar+Charger",prosRaw:["Ultra-light 1.3 lbs","3 USB outputs","Under $65","Charges phones in direct sun"],consRaw:["28W won't charge power stations","No battery storage","Inconsistent in shade","USB-C maxes at 18W"],verdict:"Entry-level that works. 1.3 lbs in a pack. Triple-USB charges phone + watch + earbuds. Device charger, not power source.",quirks:"Output drops if one cell shaded. Smart-IC resets on clouds. Best hung from backpack.",peopleSay:"Hikers swear by it. 'Best $65 on gear.' Survives rain and drops.",tags:["Budget Pick","Best for Hiking"]},
  {id:4,name:"EcoFlow 220W Bifacial",brand:"EcoFlow",watts:220,price:449,rating:4.6,reviews:987,type:"Bifacial Monocrystalline",weight:"20.5 lbs",warranty:"4 years",bestFor:"Maximum Output",efficiency:"23%",amazonSearch:"EcoFlow+220W+Bifacial+Solar+Panel",prosRaw:["Bifacial collects reflected light +10-25%","Self-supporting kickstand","Highest real-world output","IP68 waterproof"],consRaw:["Heavy for carries","Expensive","Bifacial needs reflective surface","Large folded size"],verdict:"Most interesting tech. Bifacial works on snow/sand/concrete for 10-25% more. Best-in-class kickstand. IP68 highest waterproofing.",quirks:"Bifacial gain varies: 25% snow, 5% grass. Catches wind. Direct-sun efficiency closer to 19-20%.",peopleSay:"Tech reviewers rate highest. Outproduces competitors 15-20% in ideal conditions.",tags:["Tech Pick","Best Output"]},
  {id:5,name:"BougeRV Yuma 200W CIGS",brand:"BougeRV",watts:200,price:379,rating:4.2,reviews:642,type:"Thin-Film CIGS",weight:"8.4 lbs",warranty:"5 years",bestFor:"Curved Surfaces",efficiency:"15.8%",amazonSearch:"BougeRV+Yuma+200W+CIGS+Flexible",prosRaw:["Thin and flexible for curves","8.4 lbs for 200W","Peel-and-stick mount","Better shade tolerance"],consRaw:["Lower 15.8% efficiency","Less proven long-term","More expensive per watt","Scratches easily"],verdict:"CIGS thin-film flexes onto curved RV roofs and boats. 8.4 lbs for 200W is remarkable. Trade-off: 30% more area needed.",quirks:"Peel-and-stick is permanent. Scratches during transport. Better hot-weather performance.",peopleSay:"RV/boat owners love form factor. 'Game-changer' for curved surfaces.",tags:["Most Innovative"]},
  {id:6,name:"FlexSolar 40W Portable",brand:"FlexSolar",watts:40,price:79,rating:4.3,reviews:1834,type:"Foldable Monocrystalline",weight:"2.9 lbs",warranty:"2 years",bestFor:"Portable Station Charging",efficiency:"23%",amazonSearch:"FlexSolar+40W+Portable+Solar+Panel",prosRaw:["DC output for faster station charging","Compact book-size folded","Unfolds flat instantly","USB-C + USB-A + DC versatility"],consRaw:["40W slow for large stations","DC cable compatibility varies","Higher per-watt cost","Basic kickstand"],verdict:"Sweet spot between BigBlue and 200W panels. DC output charges stations faster than USB-only. Triple-output versatility.",quirks:"DC voltage varies with sun. No clasps to stay folded. Some wish DC cable longer.",peopleSay:"'No velcro' design gets passionate reviews. Works with EcoFlow and Jackery.",tags:["Best Mid-Range"]}
];

const POWER_STATIONS=[
  {id:1,name:"Anker SOLIX C1000",brand:"Anker",capacity:"1,056 Wh",output:"1,800W",price:649,rating:4.6,reviews:2156,weight:"28 lbs",battery:"LiFePO4",cycles:"3,000+",warranty:"5 years",bestFor:"Best Overall",amazonSearch:"Anker+SOLIX+C1000+Portable+Power+Station",prosRaw:["Regularly on sale under $500","3,000+ cycle LiFePO4","11 ports incl. 2× 100W USB-C","58-min full recharge","HyperFlash doesn't degrade battery"],consRaw:["No built-in light","App can be buggy","Fan audible under load","No expansion option"],verdict:"Consensus pick. Sweet spot of price, capacity, quality, speed. 58-min recharge impressive. At sale <$500, best value in category.",quirks:"App optional. Fan noticeable under load. 1,800W handles most but not space heaters.",peopleSay:"#1 or #2 across review sites. 'Best bang for buck.' Low complaint frequency.",tags:["Editor's Pick","Best Value"]},
  {id:2,name:"EcoFlow DELTA 2 Max",brand:"EcoFlow",capacity:"2,048 Wh",output:"2,400W",price:1599,rating:4.5,reviews:1823,weight:"50.7 lbs",battery:"LiFePO4",cycles:"3,000+",warranty:"5 years",bestFor:"Home Backup",amazonSearch:"EcoFlow+DELTA+2+Max",prosRaw:["Massive 2,048Wh","15 output ports","X-Boost to 3,400W surge","Expandable to 6,144Wh","Smart app controls"],consRaw:["50.7 lbs","$1,599 MSRP","Learning curve","Loud fan"],verdict:"Serious home backup. Expandable to 6,144Wh for multi-hour outages. 15 ports. X-Boost handles over-rated appliances.",quirks:"X-Boost reduces voltage. Expansion batteries $900+. Eco mode timeout needs adjustment.",peopleSay:"Homeowners and preppers rate highest. Kept fridges running during outages.",tags:["Best Home Backup"]},
  {id:3,name:"Jackery Explorer 1000 v2",brand:"Jackery",capacity:"1,070 Wh",output:"1,500W",price:799,rating:4.4,reviews:3421,weight:"23.8 lbs",battery:"LiFePO4",cycles:"4,000",warranty:"5 years",bestFor:"Camping & Ease of Use",amazonSearch:"Jackery+Explorer+1000+v2",prosRaw:["Lightest at 23.8 lbs","Most intuitive interface","60-min recharge","Color-coded cables","4,000 cycle rating"],consRaw:["$799 pricier than Anker","Fewer ports (8 vs 15)","Proprietary solar connector","Not expandable"],verdict:"UX champion. Clear display, color-coded cables. 4,000 cycles = 11+ years. Premium over Anker is a UX tax.",quirks:"Third-party panels need $25 adapter. Power button on back. App less feature-rich.",peopleSay:"'It just works.' Compared to Apple. Orange color polarizing.",tags:["Easiest to Use"]},
  {id:4,name:"Bluetti AC70",brand:"Bluetti",capacity:"768 Wh",output:"1,000W",price:449,rating:4.3,reviews:1029,weight:"22.5 lbs",battery:"LiFePO4",cycles:"3,500+",warranty:"5 years",bestFor:"Best Budget LiFePO4",amazonSearch:"Bluetti+AC70+Portable+Power+Station",prosRaw:["Best price-to-capacity LiFePO4","2,000W surge","70-min to 80%","Clear display","Turbo charging"],consRaw:["Louder fan","Smallest capacity here","App connectivity issues","Bluetooth-only"],verdict:"Budget LiFePO4 entry. Undercuts by $200+ with solid quality. 2,000W surge handles fridge startups.",quirks:"Fan noise #1 complaint. Bluetooth only. Turbo mode generates heat.",peopleSay:"Budget buyers love it. 'Undeniable value.' Recommended as first purchase.",tags:["Budget Pick"]},
  {id:5,name:"EcoFlow River 3 Plus",brand:"EcoFlow",capacity:"286 Wh",output:"600W",price:219,rating:4.5,reviews:763,weight:"7.8 lbs",battery:"LiFePO4",cycles:"3,000+",warranty:"5 years",bestFor:"Ultra-Portable",amazonSearch:"EcoFlow+River+3+Plus",prosRaw:["7.8 lbs","GaN technology","Built-in light","Charges laptops/drones","X-Boost to 600W"],consRaw:["286Wh small","No serious appliances","Higher per-Wh cost","USB-C maxes 100W"],verdict:"'Always in the car' station. GaN tech runs cooler/faster. Built-in light. For laptops, phones, drones, CPAP.",quirks:"Avoid enclosing during use. Battery % jumps near 0/100. Motion-detection light mode.",peopleSay:"Photographers and drone pilots love it. 'Best sub-$250 station.'",tags:["Most Portable"]},
  {id:6,name:"Goal Zero Yeti 500",brand:"Goal Zero",capacity:"505 Wh",output:"500W",price:399,rating:4.4,reviews:2187,weight:"14 lbs",battery:"NMC Li-ion",cycles:"500",warranty:"2 years",bestFor:"Extreme Weather",amazonSearch:"Goal+Zero+Yeti+500",prosRaw:["Rated to -4°F","Storm hood for ports","Premium build","No-app simplicity","Proven track record"],consRaw:["Only 500 cycles","2-year warranty","Higher price per Wh","Heavier than LiFePO4","Older tech"],verdict:"Legacy pick for extreme cold. -4°F rating unmatched. NMC battery is the weakness: 500 vs 3,000+ cycles.",quirks:"LiFePO4 struggles below freezing. Proprietary cables. Excellent accessory ecosystem.",peopleSay:"Ice fishers and climbers recommend. Capacity fade after 2-3 years heavy use.",tags:["Best for Cold Weather"]}
];

// Appliance database for "What Can I Run?" calc
const APPLIANCES=[
  {name:"Mini Fridge",watts:60,icon:"🧊"},{name:"CPAP Machine",watts:40,icon:"😴"},
  {name:"Laptop",watts:60,icon:"💻"},{name:"LED Lights (5)",watts:50,icon:"💡"},
  {name:"Phone Charger",watts:20,icon:"📱"},{name:"WiFi Router",watts:12,icon:"📶"},
  {name:"TV (42\")",watts:80,icon:"📺"},{name:"Electric Blanket",watts:200,icon:"🛏️"},
  {name:"Portable Fan",watts:40,icon:"🌀"},{name:"Coffee Maker",watts:900,icon:"☕"},
  {name:"Microwave",watts:1000,icon:"🔥"},{name:"Hair Dryer",watts:1500,icon:"💇"},
  {name:"Blender",watts:400,icon:"🥤"},{name:"Drone Charger",watts:90,icon:"🚁"},
  {name:"Camera Charger",watts:30,icon:"📷"},{name:"Space Heater",watts:1500,icon:"🔥"}
];

// ─── HELPERS ───
const fmt=n=>Math.abs(n)>=1000?`$${(n/1000).toFixed(1)}k`:`$${Math.round(n)}`;
const amazonLink=(q)=>`https://www.amazon.com/s?k=${q}`;

// ─── UI ATOMS ───
const Stars=({n,t})=>{const f=Math.floor(n),h=n%1>=.5;return<span style={{display:"inline-flex",gap:1}}>{Array.from({length:5},(_,i)=><span key={i} style={{color:i<f||(i===f&&h)?t.star:t.border,fontSize:14}}>{i<f?"★":(i===f&&h?"★":"☆")}</span>)}</span>};

const Badge=({type="info",children,t})=>{const s={estimated:{bg:t.warnBg,color:t.warn},real:{bg:t.greenLight,color:t.greenDark},info:{bg:t.blueBg,color:t.blue},tag:{bg:t.greenLight,color:t.greenDark}};const c=s[type]||s.info;return<span style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:4,background:c.bg,color:c.color,whiteSpace:"nowrap"}}>{children}</span>};

const Tip=({text,t})=>{const[s,setS]=useState(false);return<span style={{position:"relative",display:"inline-flex",marginLeft:4}}><button onClick={()=>setS(!s)} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:"50%",width:18,height:18,fontSize:11,color:t.textLight,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0}}>?</button>{s&&<div style={{position:"absolute",bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",background:t.text,color:t.bg,fontSize:12,lineHeight:1.5,padding:"8px 12px",borderRadius:8,width:220,zIndex:10,boxShadow:`0 4px 16px ${t.shadow}`}}>{text}</div>}</span>};

const Input=({label,tip,value,onChange,type="text",suffix,prefix,min,max,step,error,t,...rest})=>(
  <div style={{marginBottom:14}}>
    {label&&<label style={{fontSize:13,fontWeight:600,color:t.textMid,display:"flex",alignItems:"center",gap:4,marginBottom:6}}>{label}{tip&&<Tip text={tip} t={t}/>}</label>}
    <div style={{display:"flex",alignItems:"center",border:`1.5px solid ${error?t.err:t.border}`,borderRadius:10,background:t.white,overflow:"hidden",transition:"border-color .2s"}}>{prefix&&<span style={{padding:"0 0 0 12px",color:t.textLight,fontSize:14}}>{prefix}</span>}<input value={value} onChange={e=>onChange(type==="number"?(e.target.value===""?"":Number(e.target.value)):e.target.value)} type={type} min={min} max={max} step={step} style={{border:"none",outline:"none",padding:"11px 12px",fontSize:14,width:"100%",background:"transparent",color:t.text}} {...rest}/>{suffix&&<span style={{padding:"0 12px 0 0",color:t.textLight,fontSize:13,whiteSpace:"nowrap"}}>{suffix}</span>}</div>
    {error&&<div style={{fontSize:12,color:t.err,marginTop:4}}>{error}</div>}
  </div>
);

const Select=({label,value,onChange,options,t,tip})=>(<div style={{marginBottom:14}}>{label&&<label style={{fontSize:13,fontWeight:600,color:t.textMid,display:"flex",alignItems:"center",gap:4,marginBottom:6}}>{label}{tip&&<Tip text={tip} t={t}/>}</label>}<select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",border:`1.5px solid ${t.border}`,borderRadius:10,padding:"11px 12px",fontSize:14,background:t.white,color:t.text,cursor:"pointer",outline:"none"}}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>);

const Slider=({label,value,onChange,min,max,step=1,suffix="",tip,t})=>(<div style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><label style={{fontSize:13,fontWeight:600,color:t.textMid,display:"flex",alignItems:"center",gap:4}}>{label}{tip&&<Tip text={tip} t={t}/>}</label><span style={{fontSize:14,fontWeight:700,color:t.text}}>{typeof value==="number"?value.toLocaleString():value}{suffix}</span></div><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",accentColor:t.green,cursor:"pointer"}}/></div>);

const Toggle=({label,value,onChange,tip,t})=>(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,padding:"6px 0"}}><label style={{fontSize:13,fontWeight:600,color:t.textMid,display:"flex",alignItems:"center",gap:4}}>{label}{tip&&<Tip text={tip} t={t}/>}</label><button onClick={()=>onChange(!value)} style={{width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",position:"relative",transition:"background .2s",background:value?t.green:t.border}}><div style={{width:20,height:20,borderRadius:10,background:"#fff",position:"absolute",top:2,transition:"left .2s",left:value?22:2,boxShadow:"0 1px 4px rgba(0,0,0,.15)"}}/></button></div>);

const Collapsible=({title,children,defaultOpen=false,t})=>{const[o,setO]=useState(defaultOpen);return<div style={{borderTop:`1px solid ${t.borderLight}`,marginTop:8}}><button onClick={()=>setO(!o)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",background:"none",border:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:t.textMid}}>{title}<span style={{transform:o?"rotate(180deg)":"none",transition:"transform .2s",fontSize:12}}>▼</span></button>{o&&<div style={{paddingBottom:14}}>{children}</div>}</div>};

const ChartTip=({active,payload,label,prefix="",suffix="",t})=>{if(!active||!payload?.length)return null;return<div style={{background:t.white,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",boxShadow:`0 2px 12px ${t.shadow}`,fontSize:13}}><div style={{color:t.textLight,fontSize:11,marginBottom:4}}>{label}</div>{payload.map((p,i)=><div key={i} style={{color:p.color||t.text,fontWeight:600}}>{p.name}: {prefix}{typeof p.value==="number"?p.value.toLocaleString():p.value}{suffix}</div>)}</div>};

const AnimCount=({end,prefix="",suffix="",duration=1200,t})=>{const[v,setV]=useState(0);const ref=useRef();useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){let s=performance.now();const a=()=>{const p=Math.min((performance.now()-s)/duration,1);setV(Math.round(end*p*p));if(p<1)requestAnimationFrame(a)};a();obs.disconnect()}},{threshold:.3});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect()},[end,duration]);return<span ref={ref} style={{fontWeight:800,color:t.text,fontVariantNumeric:"tabular-nums"}}>{prefix}{v.toLocaleString()}{suffix}</span>};

// Fade-in on scroll
const FadeIn=({children,delay=0,t})=>{const[vis,setVis]=useState(false);const ref=useRef();useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);obs.disconnect()}},{threshold:.1});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect()},[]);return<div ref={ref} style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:`opacity .6s ease ${delay}s, transform .6s ease ${delay}s`}}>{children}</div>};

// ─── PRODUCT CARD ───
const ProductCard=({product,type,t,onSelect,selected})=>(
  <div onClick={()=>onSelect(product.id)} style={{background:selected?t.greenLight:t.white,border:`1.5px solid ${selected?t.green:t.borderLight}`,borderRadius:14,padding:20,cursor:"pointer",transition:"all .2s",transform:selected?"scale(1.01)":"scale(1)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
      <div><div style={{fontSize:11,fontWeight:600,color:t.textLight,textTransform:"uppercase",letterSpacing:".04em"}}>{product.brand}</div><div style={{fontSize:16,fontWeight:700,color:t.text,marginTop:2}}>{product.name}</div></div>
      <div style={{fontSize:20,fontWeight:800,color:t.green}}>${product.price}</div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><Stars n={product.rating} t={t}/><span style={{fontSize:12,color:t.textLight}}>({product.reviews.toLocaleString()})</span></div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{product.tags?.map(tag=><Badge key={tag} type="tag" t={t}>{tag}</Badge>)}<span style={{fontSize:12,color:t.textMid,padding:"3px 0"}}>{type==="panel"?`${product.watts}W · ${product.weight}`:`${product.capacity} · ${product.weight}`}</span></div>
    <div style={{fontSize:13,color:t.textMid,lineHeight:1.5}}><span style={{fontWeight:600}}>Best for: </span>{product.bestFor}</div>
  </div>
);

// ─── PRODUCT DETAIL ───
const ProductDetail=({product,type,t})=>{
  const[tab,setTab]=useState("verdict");
  const tabs=[{id:"verdict",label:"Our Take"},{id:"pros",label:"Pros & Cons"},{id:"people",label:"Reviews"},{id:"quirks",label:"Gotchas"}];
  return(
    <div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:24,borderBottom:`1px solid ${t.borderLight}`}}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div><div style={{fontSize:12,fontWeight:600,color:t.green,textTransform:"uppercase",letterSpacing:".05em"}}>{product.brand}</div><h3 style={{fontSize:22,fontWeight:800,color:t.text,marginTop:4}}>{product.name}</h3><div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}><Stars n={product.rating} t={t}/><span style={{fontSize:13,color:t.textMid}}>{product.rating}/5 · {product.reviews.toLocaleString()} reviews</span></div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:28,fontWeight:800,color:t.green}}>${product.price}</div><a href={amazonLink(product.amazonSearch)} target="_blank" rel="noopener noreferrer" style={{fontSize:13,color:t.green,fontWeight:600,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4,marginTop:4,padding:"6px 14px",border:`1.5px solid ${t.green}`,borderRadius:8,transition:"all .2s"}}>View on Amazon →</a></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))",gap:10,marginTop:16}}>
          {(type==="panel"?[{l:"Watts",v:`${product.watts}W`},{l:"Efficiency",v:product.efficiency},{l:"Weight",v:product.weight},{l:"Type",v:product.type?.split(" ")[0]},{l:"Warranty",v:product.warranty}]:[{l:"Capacity",v:product.capacity},{l:"Output",v:product.output},{l:"Battery",v:product.battery},{l:"Cycles",v:product.cycles},{l:"Warranty",v:product.warranty}]).map((s,i)=>(<div key={i} style={{padding:10,background:t.card,borderRadius:8,textAlign:"center"}}><div style={{fontSize:11,color:t.textLight,fontWeight:600}}>{s.l}</div><div style={{fontSize:14,fontWeight:700,color:t.text,marginTop:2}}>{s.v}</div></div>))}
        </div>
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${t.borderLight}`,overflow:"auto"}}>{tabs.map(tb=>(<button key={tb.id} onClick={()=>setTab(tb.id)} style={{padding:"12px 20px",fontSize:13,fontWeight:tab===tb.id?700:500,color:tab===tb.id?t.green:t.textMid,background:"none",border:"none",borderBottom:tab===tb.id?`2px solid ${t.green}`:"2px solid transparent",cursor:"pointer",whiteSpace:"nowrap"}}>{tb.label}</button>))}</div>
      <div style={{padding:24}}>
        {tab==="verdict"&&<div style={{fontSize:14,color:t.textMid,lineHeight:1.75}}>{product.verdict}</div>}
        {tab==="pros"&&<div><div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:700,color:t.greenDark,marginBottom:8}}>STRENGTHS</div>{product.prosRaw.map((p,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6,fontSize:14,color:t.textMid,lineHeight:1.5}}><span style={{color:t.green}}>✓</span>{p}</div>)}</div><div><div style={{fontSize:13,fontWeight:700,color:t.err,marginBottom:8}}>WEAKNESSES</div>{product.consRaw.map((c,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6,fontSize:14,color:t.textMid,lineHeight:1.5}}><span style={{color:t.err}}>✗</span>{c}</div>)}</div></div>}
        {tab==="people"&&<div style={{fontSize:14,color:t.textMid,lineHeight:1.75}}>{product.peopleSay}</div>}
        {tab==="quirks"&&<div style={{fontSize:14,color:t.textMid,lineHeight:1.75}}>{product.quirks}</div>}
      </div>
      <div style={{padding:"12px 24px 16px",borderTop:`1px solid ${t.borderLight}`,display:"flex",gap:8,justifyContent:"flex-end"}}><a href={amazonLink(product.amazonSearch)} target="_blank" rel="noopener noreferrer" style={{fontSize:13,fontWeight:600,color:"#fff",background:t.green,padding:"10px 20px",borderRadius:8,textDecoration:"none",transition:"opacity .2s"}}>Check Price on Amazon →</a></div>
    </div>
  );
};

// ─── AI CHAT WIDGET ───
function ChatWidget({t,navigate}){
  const[open,setOpen]=useState(false);
  const[msgs,setMsgs]=useState([{from:"bot",text:"Hey! I'm Wattbot. Ask me anything about EVs, solar, or energy savings. Try: \"Is solar worth it in Ohio?\" or \"Compare Tesla Model 3 vs Camry\""}]);
  const[input,setInput]=useState("");
  const ref=useRef();
  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight},[msgs]);

  const respond=(q)=>{
    const ql=q.toLowerCase();
    // Solar worth it
    if(ql.includes("solar")&&(ql.includes("worth")||ql.includes("good"))){
      const stMatch=Object.keys(SD).find(s=>ql.includes(s.toLowerCase()));
      if(stMatch){const d=SD[stMatch];return `In ${stMatch}, you get about ${d.s} sun-hours/day with electricity at ${d.e}¢/kWh. ${d.s>=5?"That's excellent solar potential!":d.s>=4?"Decent solar potential.":"Solar is possible but not ideal."} ${d.nm==="full"?"Full net metering helps a lot.":d.nm==="partial"?"Partial net metering available.":"No net metering unfortunately."} ${d.sc>0?`Plus a $${d.sc} state credit!`:""} Want exact numbers? Try our Solar ROI Calculator!`}
      return "I can check solar potential for any state! Just mention the state, like 'Is solar worth it in Texas?' Or jump into our Solar ROI Calculator for exact numbers based on your ZIP."
    }
    // EV compare
    if(ql.includes("compare")||ql.includes("vs")||(ql.includes("ev")&&ql.includes("save"))){
      return "Great question! EV savings depend heavily on your location — electricity rates, gas prices, and available incentives vary by state. On average, EV owners save $1,000-2,500/year in fuel costs. Our EV Calculator uses your ZIP code for exact numbers. Want me to walk you through it?"
    }
    // Power station
    if(ql.includes("power station")||ql.includes("battery")||ql.includes("portable power")){
      return "For power stations, the Anker SOLIX C1000 is our top pick for most people — great value at ~$500 on sale with LiFePO4 longevity. Need home backup? EcoFlow DELTA 2 Max. Ultra-portable? EcoFlow River 3 Plus at 7.8 lbs. Check our Gear Reviews for detailed breakdowns!"
    }
    // State info
    const stateMatch=Object.keys(SD).find(s=>ql.includes(s.toLowerCase()));
    if(stateMatch){const d=SD[stateMatch];return `${stateMatch}: Electricity ${d.e}¢/kWh, gas $${d.g}/gal, ${d.s} sun-hrs/day, ${d.z} climate. ${d.ec>0?`EV incentive: $${d.ec}.`:"No state EV incentive."} ${d.nm} net metering. Grid is ${d.gc}% renewable.`}
    // General
    if(ql.includes("hello")||ql.includes("hi")||ql.includes("hey"))return "Hey there! What energy question can I help with? I know about EVs, solar panels, power stations, and state-by-state energy data.";
    if(ql.includes("thank"))return "You're welcome! Feel free to ask anything else about energy savings.";
    return "I can help with: EV savings estimates, solar panel ROI, power station recommendations, and state energy data. Try asking something like 'What are electricity rates in California?' or 'Which power station should I buy?'"
  };

  const send=()=>{
    if(!input.trim())return;
    const q=input.trim();
    setMsgs(p=>[...p,{from:"user",text:q}]);
    setInput("");
    setTimeout(()=>setMsgs(p=>[...p,{from:"bot",text:respond(q)}]),400+Math.random()*400);
  };

  if(!open)return<button onClick={()=>setOpen(true)} style={{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:28,background:t.green,color:"#fff",border:"none",cursor:"pointer",fontSize:24,boxShadow:`0 4px 20px ${t.shadow}`,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .2s"}}>⚡</button>;

  return(
    <div style={{position:"fixed",bottom:24,right:24,width:380,maxWidth:"calc(100vw - 48px)",height:500,maxHeight:"calc(100vh - 100px)",background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:16,boxShadow:`0 8px 40px ${t.shadow}`,zIndex:200,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${t.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:t.green,color:"#fff"}}><div><div style={{fontWeight:700,fontSize:15}}>⚡ Wattbot</div><div style={{fontSize:11,opacity:.7}}>Powered by your data, not GPT</div></div><button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:"#fff",fontSize:20,cursor:"pointer"}}>✕</button></div>
      <div ref={ref} style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=><div key={i} style={{alignSelf:m.from==="user"?"flex-end":"flex-start",maxWidth:"85%",padding:"10px 14px",borderRadius:m.from==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.from==="user"?t.green:t.card,color:m.from==="user"?"#fff":t.text,fontSize:13,lineHeight:1.5}}>{m.text}</div>)}
      </div>
      <div style={{padding:12,borderTop:`1px solid ${t.borderLight}`,display:"flex",gap:8}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about EVs, solar, energy..." style={{flex:1,border:`1px solid ${t.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,background:t.bg,color:t.text,outline:"none"}}/><button onClick={send} style={{background:t.green,color:"#fff",border:"none",borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Send</button></div>
    </div>
  );
}

// ─── WHAT CAN I RUN CALCULATOR ───
function WhatCanIRunPage({t}){
  const[stationId,setStationId]=useState(1);
  const[selected,setSelected]=useState(["Mini Fridge","Phone Charger","LED Lights (5)","WiFi Router"]);
  const station=POWER_STATIONS.find(s=>s.id===stationId);
  const wh=parseFloat(station.capacity.replace(/,/g,""));
  const totalW=selected.reduce((s,n)=>{const a=APPLIANCES.find(x=>x.name===n);return s+(a?a.watts:0)},0);
  const hours=totalW>0?Math.round(wh/totalW*10)/10:0;
  const overload=totalW>parseFloat(station.output.replace(/[^0-9]/g,""));

  return(
    <div>
      <h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>What Can I Run?</h1>
      <p style={{fontSize:16,color:t.textMid,lineHeight:1.6,marginTop:8,maxWidth:600}}>Pick a power station and check off appliances to see how long they'll last.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:28,marginTop:28}}>
        <div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:22}}>
          <Select label="Power Station" value={stationId} onChange={v=>setStationId(Number(v))} t={t} options={POWER_STATIONS.map(s=>({value:s.id,label:`${s.name} (${s.capacity})`}))}/>
          <div style={{fontSize:13,fontWeight:600,color:t.textMid,marginBottom:12}}>Select appliances:</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {APPLIANCES.map(a=>{const on=selected.includes(a.name);return(
              <button key={a.name} onClick={()=>setSelected(p=>on?p.filter(x=>x!==a.name):[...p,a.name])} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:10,border:`1.5px solid ${on?t.green:t.borderLight}`,background:on?t.greenLight:t.white,cursor:"pointer",transition:"all .15s",fontSize:13,color:t.text,fontWeight:on?600:400,textAlign:"left"}}>
                <span style={{fontSize:18}}>{a.icon}</span>
                <div><div>{a.name}</div><div style={{fontSize:11,color:t.textLight}}>{a.watts}W</div></div>
              </button>
            )})}
          </div>
        </div>
        <div>
          <div style={{background:overload?t.err:t.green,borderRadius:14,padding:22,color:"#fff",marginBottom:16}}>
            {overload?<><div style={{fontSize:14,fontWeight:700}}>⚠️ Overload!</div><div style={{fontSize:13,opacity:.8,marginTop:4}}>Total {totalW}W exceeds {station.output} output. Remove some appliances.</div></>:<>
              <div style={{fontSize:12,opacity:.7}}>Estimated Runtime</div>
              <div style={{fontSize:42,fontWeight:800}}>{hours > 99 ? "99+" : hours} hrs</div>
              <div style={{fontSize:13,opacity:.8,marginTop:4}}>{totalW}W total from {selected.length} appliances · {station.capacity} capacity</div>
            </>}
          </div>
          <div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:18}}>
            <div style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:12}}>Runtime Breakdown</div>
            {selected.map(name=>{const a=APPLIANCES.find(x=>x.name===name);if(!a)return null;const h=Math.round(wh/a.watts*10)/10;return(
              <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${t.borderLight}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span>{a.icon}</span><span style={{fontSize:13,color:t.text}}>{a.name}</span></div>
                <div style={{fontSize:13,fontWeight:600,color:t.green}}>{h>99?"99+":h} hrs alone</div>
              </div>
            )})}
            {selected.length===0&&<div style={{fontSize:13,color:t.textLight,textAlign:"center",padding:20}}>Select appliances to see runtime</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CARBON IMPACT ───
function CarbonPage({t}){
  const[miles,setMiles]=useState(12000);
  const[years,setYears]=useState(5);
  const[mpg,setMpg]=useState(30);
  const co2PerGallon=8.887;
  const totalGallons=(miles*years)/mpg;
  const totalCO2=totalGallons*co2PerGallon/1000;
  const trees=Math.round(totalCO2/0.022);
  const flights=Math.round(totalCO2/0.9*10)/10;
  const phones=Math.round(totalCO2*1000/0.008);

  return(
    <div>
      <h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>Carbon Impact Calculator</h1>
      <p style={{fontSize:16,color:t.textMid,lineHeight:1.6,marginTop:8,maxWidth:600}}>See the environmental impact of switching from gas to electric, in terms you can actually picture.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:28,marginTop:28}}>
        <div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:22}}>
          <Slider label="Annual Miles" value={miles} onChange={setMiles} min={3000} max={40000} step={1000} t={t}/>
          <Slider label="Years" value={years} onChange={setYears} min={1} max={15} suffix=" yrs" t={t}/>
          <Slider label="Current MPG" value={mpg} onChange={setMpg} min={15} max={50} suffix=" mpg" t={t}/>
          <div style={{marginTop:16,padding:14,background:t.card,borderRadius:10,fontSize:13,color:t.textMid,lineHeight:1.8}}>
            <div>Total gas avoided: <b>{Math.round(totalGallons).toLocaleString()} gallons</b></div>
            <div>CO₂ prevented: <b>{totalCO2.toFixed(1)} metric tons</b></div>
          </div>
        </div>
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[
              {icon:"🌳",value:trees.toLocaleString(),label:"Trees needed to absorb that CO₂",sub:`Over ${years} years of growth`},
              {icon:"✈️",value:flights,label:"Round-trip NYC↔LA flights",sub:"In equivalent emissions"},
              {icon:"📱",value:phones.toLocaleString(),label:"Phone charges worth of energy",sub:"From the gas you won't burn"},
              {icon:"🏠",value:Math.round(totalCO2*1000/7.5).toLocaleString(),label:"Home-days of electricity",sub:"Average US household"}
            ].map((c,i)=>(
              <div key={i} style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:20,textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:8}}>{c.icon}</div>
                <div style={{fontSize:28,fontWeight:800,color:t.green}}>{c.value}</div>
                <div style={{fontSize:13,fontWeight:600,color:t.text,marginTop:4}}>{c.label}</div>
                <div style={{fontSize:11,color:t.textLight,marginTop:2}}>{c.sub}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:16,background:t.greenLight,borderRadius:14,textAlign:"center"}}>
            <div style={{fontSize:15,fontWeight:700,color:t.greenDark}}>Your switch prevents {totalCO2.toFixed(1)} metric tons of CO₂</div>
            <div style={{fontSize:13,color:t.textMid,marginTop:6}}>That's like planting {trees.toLocaleString()} trees and letting them grow for {years} years.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REFERRAL LINKS PAGE (Supabase-ready) ───
function ReferralPage({t}){
  const[referrals]=useState([
    {id:1,type:"Tesla",name:"Sarah M.",code:"sarah-tesla-ref",desc:"Get $500 off + 3 months free Supercharging",upvotes:142,date:"2025-12"},
    {id:2,type:"Tesla",name:"Mike R.",code:"mike-model-y",desc:"$500 off any new Tesla + free charging credits",upvotes:89,date:"2025-11"},
    {id:3,type:"SunPower",name:"James K.",code:"james-sunpower",desc:"$500 off SunPower solar installation",upvotes:67,date:"2025-12"},
    {id:4,type:"Tesla",name:"Lisa T.",code:"lisa-tesla-2025",desc:"$500 off + referral bonus charging",upvotes:54,date:"2025-12"},
    {id:5,type:"Enphase",name:"Dave W.",code:"dave-enphase",desc:"Free Enphase battery monitoring for 1 year",upvotes:38,date:"2025-10"},
  ]);
  const[filter,setFilter]=useState("all");
  const filtered=filter==="all"?referrals:referrals.filter(r=>r.type===filter);

  return(
    <div>
      <h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>Community Referral Links</h1>
      <p style={{fontSize:16,color:t.textMid,lineHeight:1.6,marginTop:8,maxWidth:600}}>Save money with referral codes from our community. Share yours too!</p>
      <div style={{display:"flex",gap:8,marginTop:20,marginBottom:24,flexWrap:"wrap"}}>
        {["all","Tesla","SunPower","Enphase"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:filter===f?700:500,background:filter===f?t.green:"transparent",color:filter===f?"#fff":t.textMid,border:`1.5px solid ${filter===f?t.green:t.border}`,cursor:"pointer",transition:"all .2s"}}>{f==="all"?"All":f}</button>
        ))}
      </div>
      <div style={{display:"grid",gap:12,maxWidth:700}}>
        {filtered.map(r=>(
          <div key={r.id} style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:20,display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><Badge type="tag" t={t}>{r.type}</Badge><span style={{fontSize:13,fontWeight:600,color:t.text}}>{r.name}</span><span style={{fontSize:11,color:t.textLight}}>{r.date}</span></div>
              <div style={{fontSize:14,color:t.textMid,marginBottom:6}}>{r.desc}</div>
              <code style={{fontSize:12,padding:"4px 8px",background:t.card,borderRadius:4,color:t.green,fontWeight:600}}>{r.code}</code>
            </div>
            <div style={{textAlign:"center",flexShrink:0}}>
              <button style={{background:t.card,border:`1px solid ${t.borderLight}`,borderRadius:8,padding:"8px 12px",cursor:"pointer",fontSize:12,color:t.textMid,fontWeight:600}}>▲ {r.upvotes}</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:24,padding:20,background:t.greenLight,borderRadius:14,textAlign:"center"}}>
        <div style={{fontSize:16,fontWeight:700,color:t.greenDark}}>Have a referral code?</div>
        <div style={{fontSize:13,color:t.textMid,marginTop:6,marginBottom:12}}>Submit yours to help the community save. Coming soon with account signup!</div>
        <button style={{background:t.green,color:"#fff",border:"none",borderRadius:10,padding:"12px 24px",fontSize:14,fontWeight:600,cursor:"pointer"}}>Submit Your Referral →</button>
      </div>
      <div style={{marginTop:16,padding:14,background:t.card,borderRadius:10,fontSize:12,color:t.textLight}}>Referral links are user-submitted. Wattfull does not guarantee or endorse any referral program. Verify terms with the provider.</div>
    </div>
  );
}

// ─── COMPARISON TOOL ───
function ComparePage({t}){
  const[tab,setTab]=useState("ev");
  const[sel1,setSel1]=useState("model3lr");
  const[sel2,setSel2]=useState("ioniq5");
  const[pSel1,setPSel1]=useState(1);
  const[pSel2,setPSel2]=useState(4);

  if(tab==="ev"){
    const a=VEHICLES.ev.find(v=>v.id===sel1),b=VEHICLES.ev.find(v=>v.id===sel2);
    return(<div>
      <h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>Compare Side-by-Side</h1>
      <div style={{display:"inline-flex",gap:4,padding:4,background:t.card,borderRadius:10,marginTop:16,marginBottom:24}}>{[{id:"ev",label:"⚡ EVs"},{id:"stations",label:"🔋 Stations"}].map(tb=><button key={tb.id} onClick={()=>setTab(tb.id)} style={{padding:"10px 20px",borderRadius:8,fontSize:14,fontWeight:tab===tb.id?700:500,background:tab===tb.id?t.white:"transparent",color:tab===tb.id?t.text:t.textMid,border:"none",cursor:"pointer"}}>{tb.label}</button>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Select value={sel1} onChange={setSel1} t={t} options={VEHICLES.ev.map(v=>({value:v.id,label:v.name}))}/>
        <Select value={sel2} onChange={setSel2} t={t} options={VEHICLES.ev.map(v=>({value:v.id,label:v.name}))}/>
      </div>
      {a&&b&&<div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,overflow:"hidden",marginTop:8}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
          <thead><tr style={{background:t.card}}><th style={{padding:12,textAlign:"left",color:t.textLight,fontSize:12}}>Spec</th><th style={{padding:12,textAlign:"center",color:t.text,fontWeight:700}}>{a.name}</th><th style={{padding:12,textAlign:"center",color:t.text,fontWeight:700}}>{b.name}</th></tr></thead>
          <tbody>{[{l:"Efficiency",a:`${a.kwh} kWh/100mi`,b:`${b.kwh} kWh/100mi`,better:a.kwh<b.kwh?"a":b.kwh<a.kwh?"b":"tie"},{l:"MSRP",a:`$${a.msrp.toLocaleString()}`,b:`$${b.msrp.toLocaleString()}`,better:a.msrp<b.msrp?"a":"b"},{l:"Federal Credit",a:`$${a.fc.toLocaleString()}`,b:`$${b.fc.toLocaleString()}`,better:a.fc>b.fc?"a":"b"},{l:"Net Price",a:`$${(a.msrp-a.fc).toLocaleString()}`,b:`$${(b.msrp-b.fc).toLocaleString()}`,better:(a.msrp-a.fc)<(b.msrp-b.fc)?"a":"b"}].map((row,i)=><tr key={i} style={{borderTop:`1px solid ${t.borderLight}`}}><td style={{padding:12,color:t.textMid,fontWeight:600}}>{row.l}</td><td style={{padding:12,textAlign:"center",fontWeight:row.better==="a"?700:400,color:row.better==="a"?t.green:t.textMid}}>{row.a}{row.better==="a"?" ✓":""}</td><td style={{padding:12,textAlign:"center",fontWeight:row.better==="b"?700:400,color:row.better==="b"?t.green:t.textMid}}>{row.b}{row.better==="b"?" ✓":""}</td></tr>)}</tbody>
        </table>
      </div>}
    </div>);
  }

  const a=POWER_STATIONS.find(s=>s.id===pSel1),b=POWER_STATIONS.find(s=>s.id===pSel2);
  return(<div>
    <h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>Compare Side-by-Side</h1>
    <div style={{display:"inline-flex",gap:4,padding:4,background:t.card,borderRadius:10,marginTop:16,marginBottom:24}}>{[{id:"ev",label:"⚡ EVs"},{id:"stations",label:"🔋 Stations"}].map(tb=><button key={tb.id} onClick={()=>setTab(tb.id)} style={{padding:"10px 20px",borderRadius:8,fontSize:14,fontWeight:tab===tb.id?700:500,background:tab===tb.id?t.white:"transparent",color:tab===tb.id?t.text:t.textMid,border:"none",cursor:"pointer"}}>{tb.label}</button>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Select value={pSel1} onChange={v=>setPSel1(Number(v))} t={t} options={POWER_STATIONS.map(s=>({value:s.id,label:s.name}))}/>
      <Select value={pSel2} onChange={v=>setPSel2(Number(v))} t={t} options={POWER_STATIONS.map(s=>({value:s.id,label:s.name}))}/>
    </div>
    {a&&b&&<div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,overflow:"hidden",marginTop:8}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
        <thead><tr style={{background:t.card}}><th style={{padding:12,textAlign:"left",color:t.textLight,fontSize:12}}>Spec</th><th style={{padding:12,textAlign:"center",color:t.text,fontWeight:700}}>{a.name}</th><th style={{padding:12,textAlign:"center",color:t.text,fontWeight:700}}>{b.name}</th></tr></thead>
        <tbody>{[{l:"Capacity",a:a.capacity,b:b.capacity},{l:"Output",a:a.output,b:b.output},{l:"Price",a:`$${a.price}`,b:`$${b.price}`},{l:"Weight",a:a.weight,b:b.weight},{l:"Battery",a:a.battery,b:b.battery},{l:"Cycles",a:a.cycles,b:b.cycles},{l:"Warranty",a:a.warranty,b:b.warranty}].map((row,i)=><tr key={i} style={{borderTop:`1px solid ${t.borderLight}`}}><td style={{padding:12,color:t.textMid,fontWeight:600}}>{row.l}</td><td style={{padding:12,textAlign:"center",color:t.text}}>{row.a}</td><td style={{padding:12,textAlign:"center",color:t.text}}>{row.b}</td></tr>)}</tbody>
      </table>
    </div>}
  </div>);
}

// ─── EV CALC (unchanged logic, cleaner layout) ───
function EVCalcPage({t}){
  const[zip,setZip]=useState("");const[st,setSt]=useState(null);const[sd,setSd2]=useState(null);const[evId,setEvId]=useState("model3lr");const[iceId,setIceId]=useState("camry");const[mi,setMi]=useState(12000);const[yr,setYr]=useState(8);const[hc,setHc]=useState(85);const[pc,setPc]=useState(10);const[dc,setDc]=useState(5);const[eo,setEo]=useState("");const[go,setGo]=useState("");const[incI,setIncI]=useState(true);const[incC,setIncC]=useState(true);const[res,setRes]=useState(null);const[err,setErr]=useState({});
  useEffect(()=>{if(zip.length===5){const s=zipToState(zip);setSt(s);setSd2(s?SD[s]:null)}else{setSt(null);setSd2(null)}},[zip]);
  const ev=VEHICLES.ev.find(v=>v.id===evId),ice=VEHICLES.ice.find(v=>v.id===iceId);
  const calc=()=>{const e={};if(!/^\d{5}$/.test(zip)||!st)e.zip="Valid 5-digit ZIP";if(mi<1000||mi>50000)e.mi="1k–50k";if(hc+pc+dc!==100)e.ch="Must total 100%";setErr(e);if(Object.keys(e).length)return;const er=eo!==""?Number(eo):sd.e,gp=go!==""?Number(go):sd.g,cp=CP[sd.z]||.1;const kwhMi=(ev.kwh/100)*(incC?1+cp:1),blend=(hc/100)*(er/100)*1.12+(pc/100)*(er/100+.18)*1.06+(dc/100)*.35;const evF=kwhMi*mi*blend,iceF=(mi/ice.mpg)*gp,evM=.065*mi,iceM=.1*mi;let inc=0;if(incI)inc=ev.fc+(sd.ec||0);const yd=[];let ec=0,ic=0,be=null;for(let y=1;y<=yr;y++){ec+=evF+evM-(y===1?inc:0);ic+=iceF+iceM;if(!be&&ic-ec>0)be=y;yd.push({year:y,ev:Math.round(ec),ice:Math.round(ic),savings:Math.round(ic-ec)})}setRes({yd,total:Math.round(ic-ec),be,evCpm:(ec/(mi*yr)).toFixed(3),iceCpm:(ic/(mi*yr)).toFixed(3),evF:Math.round(evF),iceF:Math.round(iceF),evM:Math.round(evM),iceM:Math.round(iceM),inc,kwhMi:kwhMi.toFixed(3),blend:blend.toFixed(3),sensBest:Math.round((ic-ec)*1.25),sensWorst:Math.round((ic-ec)*.7),er,gp,cp:`${(cp*100).toFixed(0)}%`})};
  return(<div><h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>EV Savings Calculator</h1><p style={{fontSize:16,color:t.textMid,lineHeight:1.6,marginTop:8,maxWidth:600}}>Compare total costs using your location's actual energy prices, incentives, and climate.</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))",gap:28,marginTop:28}}><div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:22}}><Input label="ZIP Code" value={zip} onChange={setZip} error={err.zip} t={t} placeholder="e.g. 90210"/>{st&&sd&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}><Badge type="real" t={t}>{st}</Badge><Badge type="estimated" t={t}>{eo||sd.e}¢/kWh</Badge><Badge type="estimated" t={t}>${go||sd.g}/gal</Badge></div>}<Select label="EV" value={evId} onChange={setEvId} t={t} options={VEHICLES.ev.map(v=>({value:v.id,label:`${v.name} — ${v.kwh} kWh/100mi`}))}/><Select label="Gas Vehicle" value={iceId} onChange={setIceId} t={t} options={VEHICLES.ice.map(v=>({value:v.id,label:`${v.name} — ${v.mpg} MPG`}))}/><Slider label="Annual Miles" value={mi} onChange={setMi} min={3000} max={40000} step={1000} t={t}/><Slider label="Years" value={yr} onChange={setYr} min={1} max={15} suffix=" yrs" t={t}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}><Input label="Home%" type="number" value={hc} onChange={setHc} suffix="%" t={t}/><Input label="Public%" type="number" value={pc} onChange={setPc} suffix="%" t={t}/><Input label="DCFC%" type="number" value={dc} onChange={setDc} suffix="%" t={t}/></div>{hc+pc+dc!==100&&<div style={{fontSize:12,color:t.err,marginBottom:8}}>Total: {hc+pc+dc}% (need 100%)</div>}<Toggle label="Include incentives" value={incI} onChange={setIncI} t={t}/><Toggle label="Climate adjustment" value={incC} onChange={setIncC} t={t}/><Collapsible title="Override Rates" t={t}><Input label="Electricity" type="number" value={eo} onChange={setEo} suffix="¢/kWh" t={t}/><Input label="Gas" type="number" value={go} onChange={setGo} prefix="$" suffix="/gal" t={t}/></Collapsible><button onClick={calc} style={{width:"100%",background:t.green,color:"#fff",border:"none",borderRadius:12,padding:"14px 0",fontSize:15,fontWeight:700,cursor:"pointer",marginTop:8,opacity:zip.length===5?1:.5}}>Calculate Savings</button></div><div>{!res?<div style={{background:t.card,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:40,textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>⚡</div><h3 style={{fontSize:18,fontWeight:700,color:t.text}}>Enter details & calculate</h3><p style={{fontSize:14,color:t.textMid,marginTop:8}}>Full breakdown with charts and assumptions.</p></div>:(<div><div style={{background:t.green,borderRadius:14,padding:22,color:"#fff",marginBottom:16}}><div style={{fontSize:12,opacity:.7}}>{yr}-Year Total Savings</div><div style={{fontSize:"clamp(30px,5vw,42px)",fontWeight:800}}>${res.total.toLocaleString()}</div><div style={{display:"flex",gap:16,marginTop:12,flexWrap:"wrap",fontSize:14}}><div><span style={{opacity:.6}}>Break-even:</span> <b>Year {res.be||"—"}</b></div><div><span style={{opacity:.6}}>EV:</span> <b>${res.evCpm}/mi</b></div><div><span style={{opacity:.6}}>ICE:</span> <b>${res.iceCpm}/mi</b></div></div></div><div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:18,marginBottom:16}}><div style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:14}}>Cumulative Costs</div><ResponsiveContainer width="100%" height={220}><AreaChart data={res.yd}><defs><linearGradient id="evG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.green} stopOpacity={.12}/><stop offset="95%" stopColor={t.green} stopOpacity={0}/></linearGradient><linearGradient id="iceG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.textLight} stopOpacity={.1}/><stop offset="95%" stopColor={t.textLight} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/><XAxis dataKey="year" tick={{fontSize:11,fill:t.textLight}} axisLine={false} tickLine={false} tickFormatter={v=>`Yr ${v}`}/><YAxis tick={{fontSize:11,fill:t.textLight}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v)}/><Tooltip content={p=><ChartTip {...p} prefix="$" t={t}/>}/><Area type="monotone" dataKey="ice" stroke={t.textLight} strokeWidth={2} fill="url(#iceG)" name="ICE"/><Area type="monotone" dataKey="ev" stroke={t.green} strokeWidth={2.5} fill="url(#evG)" name="EV"/></AreaChart></ResponsiveContainer></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><div style={{padding:16,background:t.greenLight,borderRadius:10}}><div style={{fontSize:12,fontWeight:700,color:t.greenDark}}>EV Annual</div><div style={{fontSize:13,color:t.textMid,marginTop:6}}>Fuel: <b>${res.evF.toLocaleString()}</b></div><div style={{fontSize:13,color:t.textMid}}>Maint: <b>${res.evM.toLocaleString()}</b></div>{res.inc>0&&<div style={{fontSize:13,color:t.greenDark}}>Credits: <b>−${res.inc.toLocaleString()}</b></div>}</div><div style={{padding:16,background:t.card,borderRadius:10}}><div style={{fontSize:12,fontWeight:700,color:t.textMid}}>ICE Annual</div><div style={{fontSize:13,color:t.textMid,marginTop:6}}>Fuel: <b>${res.iceF.toLocaleString()}</b></div><div style={{fontSize:13,color:t.textMid}}>Maint: <b>${res.iceM.toLocaleString()}</b></div></div></div></div>)}</div></div></div>);
}

// ─── MARKETPLACE ───
function MarketplacePage({t}){
  const[tab,setTab]=useState("panels");const[sp,setSp]=useState(1);const[ss,setSs]=useState(1);
  const items=tab==="panels"?SOLAR_PANELS:POWER_STATIONS;const sel=tab==="panels"?SOLAR_PANELS.find(p=>p.id===sp):POWER_STATIONS.find(p=>p.id===ss);const setSel=tab==="panels"?setSp:setSs;
  return(<div><h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>Gear Reviews</h1><p style={{fontSize:16,color:t.textMid,lineHeight:1.6,marginTop:8,maxWidth:640}}>Independent assessments from real owner reviews and field reports.</p><div style={{display:"inline-flex",gap:4,padding:4,background:t.card,borderRadius:10,marginTop:20,marginBottom:24}}>{[{id:"panels",label:"☀️ Solar Panels"},{id:"stations",label:"🔋 Power Stations"}].map(tb=>(<button key={tb.id} onClick={()=>setTab(tb.id)} style={{padding:"10px 20px",borderRadius:8,fontSize:14,fontWeight:tab===tb.id?700:500,background:tab===tb.id?t.white:"transparent",color:tab===tb.id?t.text:t.textMid,border:"none",cursor:"pointer",boxShadow:tab===tb.id?`0 1px 4px ${t.shadow}`:"none"}}>{tb.label}</button>))}</div><div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:24}}><div style={{display:"flex",flexDirection:"column",gap:12,maxHeight:720,overflowY:"auto",paddingRight:8}}>{items.map(p=><ProductCard key={p.id} product={p} type={tab==="panels"?"panel":"station"} t={t} onSelect={setSel} selected={p.id===(tab==="panels"?sp:ss)}/>)}</div><div className="detail-col">{sel&&<ProductDetail product={sel} type={tab==="panels"?"panel":"station"} t={t}/>}</div></div><div style={{marginTop:24,padding:14,background:t.card,borderRadius:10,fontSize:12,color:t.textLight,lineHeight:1.6}}><b style={{color:t.textMid}}>Disclosure:</b> Product links may be affiliate links. Wattfull may earn a commission at no cost to you.</div></div>);
}

// ─── STATES ───
function StatesPage({t}){
  const[sel,setSel]=useState(null);const states=Object.entries(SD).map(([a,d])=>({a,...d,sc2:Math.round((d.gc+(d.ec>0?20:0)+(d.sc>0?10:0)+(d.nm==="full"?15:d.nm==="partial"?8:0)))})).sort((a,b)=>b.sc2-a.sc2);const gr=s=>s>=60?"A":s>=45?"B+":s>=35?"B":s>=25?"C+":s>=15?"C":"D";const gc=g=>g.startsWith("A")?t.greenDark:g.startsWith("B")?t.blue:t.textMid;const d=sel?states.find(s=>s.a===sel):null;
  return(<div><h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>State Report Cards</h1><p style={{fontSize:16,color:t.textMid,lineHeight:1.6,marginTop:8,maxWidth:600}}>Graded on grid, incentives, solar policy, and utility friendliness.</p><div style={{display:"grid",gridTemplateColumns:d?"1fr 1fr":"1fr",gap:24,marginTop:24}}><div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,overflow:"hidden"}}><div style={{overflowY:"auto",maxHeight:540}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}><thead><tr style={{background:t.card,position:"sticky",top:0}}><th style={{padding:"10px 14px",textAlign:"left",fontSize:12,fontWeight:600,color:t.textLight}}>State</th><th style={{padding:10,textAlign:"center",fontSize:12,fontWeight:600,color:t.textLight}}>Grid</th><th style={{padding:10,textAlign:"center",fontSize:12,fontWeight:600,color:t.textLight}}>EV $</th><th style={{padding:10,textAlign:"center",fontSize:12,fontWeight:600,color:t.textLight}}>Grade</th></tr></thead><tbody>{states.map(s=><tr key={s.a} onClick={()=>setSel(s.a)} style={{borderTop:`1px solid ${t.borderLight}`,cursor:"pointer",background:sel===s.a?t.greenLight:"transparent"}}><td style={{padding:"10px 14px",fontWeight:600,color:t.text}}>{s.a}</td><td style={{padding:10,textAlign:"center",color:t.textMid}}>{s.gc}%</td><td style={{padding:10,textAlign:"center",color:t.textMid}}>{s.ec>0?`$${s.ec.toLocaleString()}`:"—"}</td><td style={{padding:10,textAlign:"center",fontWeight:700,color:gc(gr(s.sc2))}}>{gr(s.sc2)}</td></tr>)}</tbody></table></div></div>{d&&<div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:24}}><h2 style={{fontSize:22,fontWeight:800,color:t.text}}>{d.a}</h2><div style={{fontSize:36,fontWeight:800,color:gc(gr(d.sc2)),marginBottom:16}}>{gr(d.sc2)}</div><div style={{fontSize:14,color:t.textMid,lineHeight:2}}><div>Electricity: <b>{d.e}¢/kWh</b></div><div>Gas: <b>${d.g}/gal</b></div><div>Solar: <b>{d.s} sun-hrs/day</b></div><div>Climate: <b>{d.z}</b></div><div>EV incentive: <b>{d.ec>0?`$${d.ec.toLocaleString()}`:"None"}</b></div><div>Net metering: <b>{d.nm}</b></div><div>Grid renewable: <b>{d.gc}%</b></div></div></div>}</div></div>);
}

// ─── SOLAR CALC ───
function SolarCalcPage({t}){
  const[zip,setZip]=useState("");const[st,setSt]=useState(null);const[sd,setSd2]=useState(null);const[kwh,setKwh]=useState(900);const[roof,setRoof]=useState(400);const[shade,setShade]=useState("light");const[orient,setOrient]=useState("south");const[cpw,setCpw]=useState(2.85);const[fed,setFed]=useState(true);const[stC,setStC]=useState(true);const[rateEsc,setRateEsc]=useState(3);const[res,setRes]=useState(null);
  useEffect(()=>{if(zip.length===5){const s=zipToState(zip);setSt(s);setSd2(s?SD[s]:null)}else{setSt(null);setSd2(null)}},[zip]);
  const calc=()=>{if(!/^\d{5}$/.test(zip)||!st)return;const d=sd,sh={none:1,light:.9,moderate:.75,heavy:.55}[shade],or={south:1,sw_se:.92,ew:.82,north:.65}[orient];const maxP=Math.floor(roof/18),annUse=kwh*12,tKw=Math.min(annUse/(d.s*365*sh*or*.82),maxP*400/1000);const sysKw=Math.round(tKw*10)/10,sysCost=sysKw*1000*cpw;const prod=sysKw*d.s*365*sh*or*.82;let itc=0;if(fed)itc+=sysCost*.3;if(stC)itc+=d.sc||0;const net=sysCost-itc;const yd=[];let cum=0,pb=null;for(let y=0;y<=25;y++){const deg=1-y*.005,rate=d.e*Math.pow(1+rateEsc/100,y)/100,yp=prod*deg,ys=y===0?0:yp*rate;cum+=ys;if(!pb&&cum>net&&y>0)pb=y;yd.push({year:y,savings:Math.round(cum),cost:Math.round(net)})}setRes({sysKw,sysCost:Math.round(sysCost),net:Math.round(net),itc:Math.round(itc),prodLow:Math.round(prod*.85),prodMed:Math.round(prod),prodHigh:Math.round(prod*1.1),pb,lifetime:Math.round(cum-net),yd,offset:Math.min(100,Math.round(prod/annUse*100))})};
  return(<div><h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text}}>Solar ROI Calculator</h1><p style={{fontSize:16,color:t.textMid,lineHeight:1.6,marginTop:8,maxWidth:600}}>Payback and lifetime savings using your location's solar resource and incentives.</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:28,marginTop:28}}><div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:22}}><Input label="ZIP Code" value={zip} onChange={setZip} t={t}/>{st&&sd&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}><Badge type="real" t={t}>{st}</Badge><Badge type="estimated" t={t}>{sd.s} sun-hrs</Badge><Badge type="estimated" t={t}>{sd.e}¢/kWh</Badge></div>}<Slider label="Monthly kWh" value={kwh} onChange={setKwh} min={200} max={3000} step={50} suffix=" kWh" t={t}/><Slider label="Usable Roof" value={roof} onChange={setRoof} min={100} max={1500} step={25} suffix=" sqft" t={t}/><Select label="Shading" value={shade} onChange={setShade} t={t} options={[{value:"none",label:"None"},{value:"light",label:"Light"},{value:"moderate",label:"Moderate"},{value:"heavy",label:"Heavy"}]}/><Select label="Orientation" value={orient} onChange={setOrient} t={t} options={[{value:"south",label:"South"},{value:"sw_se",label:"SW/SE"},{value:"ew",label:"E/W"},{value:"north",label:"North"}]}/><Toggle label="30% Federal ITC" value={fed} onChange={setFed} t={t}/><Toggle label="State credits" value={stC} onChange={setStC} t={t}/><Slider label="Rate escalation" value={rateEsc} onChange={setRateEsc} min={0} max={6} step={.5} suffix="%/yr" t={t}/><button onClick={calc} style={{width:"100%",background:t.green,color:"#fff",border:"none",borderRadius:12,padding:"14px 0",fontSize:15,fontWeight:700,cursor:"pointer",marginTop:8}}>Calculate Solar ROI</button></div><div>{!res?<div style={{background:t.card,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:40,textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>☀️</div><h3 style={{fontSize:18,fontWeight:700,color:t.text}}>Enter details & calculate</h3></div>:(<div><div style={{background:t.green,borderRadius:14,padding:22,color:"#fff",marginBottom:16}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><div><div style={{fontSize:11,opacity:.7}}>System</div><div style={{fontSize:22,fontWeight:800}}>{res.sysKw} kW</div></div><div><div style={{fontSize:11,opacity:.7}}>Net Cost</div><div style={{fontSize:22,fontWeight:800}}>${res.net.toLocaleString()}</div></div><div><div style={{fontSize:11,opacity:.7}}>Payback</div><div style={{fontSize:22,fontWeight:800}}>~{res.pb||"—"} yrs</div></div><div><div style={{fontSize:11,opacity:.7}}>25-Yr Savings</div><div style={{fontSize:22,fontWeight:800}}>${res.lifetime.toLocaleString()}</div></div></div></div><div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:18}}><div style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:14}}>Savings vs. Cost</div><ResponsiveContainer width="100%" height={220}><AreaChart data={res.yd}><defs><linearGradient id="sG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.green} stopOpacity={.12}/><stop offset="95%" stopColor={t.green} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={t.borderLight}/><XAxis dataKey="year" tick={{fontSize:11,fill:t.textLight}} axisLine={false} tickLine={false} tickFormatter={v=>`Yr ${v}`}/><YAxis tick={{fontSize:11,fill:t.textLight}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v)}/><Tooltip content={p=><ChartTip {...p} prefix="$" t={t}/>}/><Line type="monotone" dataKey="cost" stroke={t.textLight} strokeWidth={2} strokeDasharray="5 4" dot={false} name="Net Cost"/><Area type="monotone" dataKey="savings" stroke={t.green} strokeWidth={2.5} fill="url(#sG)" name="Savings"/></AreaChart></ResponsiveContainer></div></div>)}</div></div></div>);
}

// ─── METHODOLOGY ───
function MethodologyPage({t}){return(<div style={{maxWidth:720}}><h1 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:t.text,marginBottom:20}}>How It Works</h1><p style={{fontSize:16,color:t.textMid,lineHeight:1.7,marginBottom:28}}>Every number computed from defined formulas with stated inputs.</p>{[{title:"EV Savings",items:["EV fuel = (kWh/mi × miles) × blended cost × (1 + loss)","ICE fuel = (miles ÷ MPG) × gas price","Climate penalty: cold +22%, mild +5%, warm +3%, hot +4%"]},{title:"Solar ROI",items:["Production = kW × sun-hrs × 365 × shade × orientation × 0.82","Federal ITC: 30% through 2032","Degradation: 0.5%/year"]},{title:"Sources",items:["EIA State Profiles · AAA gas averages · EPA fueleconomy.gov","NREL PVWatts · DSIRE incentives · ASHRAE climate zones"]}].map((sec,i)=>(<div key={i} style={{marginBottom:28}}><h2 style={{fontSize:18,fontWeight:700,color:t.text,marginBottom:10}}>{sec.title}</h2><div style={{background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,padding:18}}>{sec.items.map((line,j)=><p key={j} style={{fontSize:13,color:t.textMid,lineHeight:1.7,marginBottom:j<sec.items.length-1?10:0}}>{line}</p>)}</div></div>))}</div>)}

// ─── HOME ───
function HomePage({navigate,t}){
  const[heroZip,setHeroZip]=useState("");const[email,setEmail]=useState("");const[emailSent,setEmailSent]=useState(false);
  return(<div>
    <section style={{padding:"clamp(48px,10vw,100px) 0 clamp(40px,8vw,72px)"}}>
      <FadeIn t={t}><div style={{maxWidth:660}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:t.greenLight,borderRadius:100,padding:"5px 14px",marginBottom:24}}><span style={{fontSize:14}}>🌱</span><span style={{fontSize:13,fontWeight:600,color:t.greenDark}}>Independent & Unbiased</span></div>
        <h1 style={{fontSize:"clamp(32px,5.5vw,52px)",fontWeight:800,lineHeight:1.1,color:t.text,letterSpacing:"-0.03em"}}>Energy decisions are<br/>expensive. <span style={{color:t.green}}>Get them right.</span></h1>
        <p style={{fontSize:"clamp(16px,2vw,19px)",color:t.textMid,lineHeight:1.65,marginTop:20,maxWidth:500}}>Real calculators with real data. Every assumption visible. Every number computed, not guessed.</p>
        <div style={{display:"flex",gap:10,marginTop:28,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",border:`1.5px solid ${t.border}`,borderRadius:12,background:t.white,overflow:"hidden"}}><span style={{paddingLeft:14,color:t.textLight,fontSize:14}}>📍</span><input value={heroZip} onChange={e=>setHeroZip(e.target.value)} placeholder="Your ZIP code" style={{border:"none",outline:"none",padding:"13px 12px",fontSize:15,background:"transparent",color:t.text,width:130}}/></div>
          <button onClick={()=>navigate("ev")} style={{background:t.green,color:"#fff",border:"none",borderRadius:12,padding:"13px 24px",fontSize:15,fontWeight:700,cursor:"pointer"}}>Run EV Savings →</button>
          <button onClick={()=>navigate("solar")} style={{background:"transparent",color:t.text,border:`1.5px solid ${t.border}`,borderRadius:12,padding:"13px 24px",fontSize:15,fontWeight:600,cursor:"pointer"}}>Solar ROI →</button>
        </div>
      </div></FadeIn>
    </section>

    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:16,paddingBottom:48,borderBottom:`1px solid ${t.border}`}}>
      {[{n:50,s:" states",l:"Full coverage"},{n:12847,s:"",l:"ZIP codes"},{n:850,s:"+",l:"Utility rates"},{n:8,s:"",l:"Free tools"}].map((s,i)=>(<FadeIn key={i} delay={i*.1} t={t}><div style={{textAlign:"center",padding:16}}><div style={{fontSize:28}}><AnimCount end={s.n} suffix={s.s} t={t} duration={1400}/></div><div style={{fontSize:12,color:t.textLight,marginTop:4}}>{s.l}</div></div></FadeIn>))}
    </section>

    <section style={{padding:"48px 0",borderBottom:`1px solid ${t.border}`}}>
      <div style={{fontSize:13,fontWeight:600,color:t.green,letterSpacing:".06em",textTransform:"uppercase",marginBottom:10}}>Tools</div>
      <h2 style={{fontSize:"clamp(22px,3.5vw,30px)",fontWeight:800,color:t.text,marginBottom:28}}>Things that actually compute</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14}}>
        {[{icon:"⚡",title:"EV Calculator",desc:"ZIP-based electricity, gas, climate, incentives.",cta:"ev"},{icon:"☀️",title:"Solar ROI",desc:"Your roof, rates, sun. 25-year projections.",cta:"solar"},{icon:"🛒",title:"Gear Reviews",desc:"Honest pros, cons, and real quirks.",cta:"marketplace"},{icon:"🔄",title:"Compare",desc:"Side-by-side EVs and power stations.",cta:"compare"},{icon:"🔋",title:"What Can I Run?",desc:"Pick a station, check appliances.",cta:"runtime"},{icon:"🌍",title:"Carbon Impact",desc:"Visualize your environmental savings.",cta:"carbon"},{icon:"🗺️",title:"State Grades",desc:"50 states graded on energy policy.",cta:"states"},{icon:"🔗",title:"Referral Links",desc:"Community codes for Tesla, solar & more.",cta:"referrals"}].map((tool,i)=>(<FadeIn key={i} delay={i*.05} t={t}><div onClick={()=>navigate(tool.cta)} style={{padding:20,border:`1px solid ${t.borderLight}`,borderRadius:14,cursor:"pointer",background:t.white,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=t.green+"66";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor=t.borderLight;e.currentTarget.style.transform="translateY(0)"}}><div style={{fontSize:24,marginBottom:8}}>{tool.icon}</div><h3 style={{fontSize:15,fontWeight:700,color:t.text,marginBottom:4}}>{tool.title}</h3><p style={{fontSize:13,color:t.textMid,lineHeight:1.5}}>{tool.desc}</p></div></FadeIn>))}
      </div>
    </section>

    <section style={{padding:"48px 0",borderBottom:`1px solid ${t.border}`}}>
      <h2 style={{fontSize:20,fontWeight:700,color:t.text,marginBottom:20}}>Quick Picks</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
        {[SOLAR_PANELS[0],POWER_STATIONS[0],SOLAR_PANELS[2]].map(p=>(<div key={p.id+p.name} onClick={()=>navigate("marketplace")} style={{padding:20,background:t.white,border:`1px solid ${t.borderLight}`,borderRadius:14,cursor:"pointer",transition:"transform .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}><div style={{fontSize:11,fontWeight:600,color:t.textLight,textTransform:"uppercase"}}>{p.brand}</div><div style={{fontSize:15,fontWeight:700,color:t.text,marginTop:4}}>{p.name}</div><div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}><Stars n={p.