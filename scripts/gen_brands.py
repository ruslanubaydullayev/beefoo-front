#!/usr/bin/env python3
"""Generate scripts/new-brands-data.mjs with exactly 551 brand entries."""
import re
from collections import Counter
from pathlib import Path

EXISTING = set(
    """2k-games,3m,7-eleven,abbott,abercrombie-fitch,ac-milan,acer,activision-blizzard,acura,adidas,adobe,afc-ajax,aig,air-france,airbnb,airbus,aldi,alfa-romeo,alibaba,alienware,allianz,amazon,amd,american-airlines,american-express,anheuser-busch,apple,armani,arsenal,asos,aston-martin,astrazeneca,asus,atari,atletico-madrid,att,audi,babolat,balenciaga,bandai-namco,bank-of-america,barclays,bayer,bayern-munich,bbc,bentley,berkshire-hathaway,best-buy,bethesda,blackrock,block,bmw,boeing,booking,borussia-dortmund,bosch,bp,british-airways,brown-university,budweiser,bugatti,buick,bundesliga,bungie,burberry,burger-king,byd,cadbury,cadillac,calvin-klein,canon,carnegie-mellon-university,carrefour,cd-projekt-red,celtic-fc,chanel,chelsea-fc,chery,chevrolet,chevron,chick-fil-a,china-mobile,chrysler,cisco,citigroup,citroen,cnn,coach,coca-cola,colgate-palmolive,conocophillips,converse,cornell-university,corona,corsair,costco,crocs,dacia,daihatsu,danone,dell,delta,deutsche-bank,deutsche-telekom,devolver-digital,dhl,dior,discord,disney,dodge,dolce-gabbana,dollar-general,dominos,doordash,dove,dropbox,ducati,duke-university,dunkin,duracell,dyson,easyjet,ebay,electronic-arts,elgato,emirates,epfl,epic-games,ericsson,espn,etsy,expedia,exxonmobil,fc-barcelona,fc-porto,fedex,fendi,ferrari,ferrero,fiat,fifa,figma,fitbit,ford,forever-21,formula-1,four-seasons,fox,fromsoftware,game-freak,gap,garmin,gearbox-software,geely,general-mills,general-motors,georgia-tech,gillette,glaxosmithkline,gog,goldman-sachs,google,gopro,grubhub,gucci,harley-davidson,hasbro,hbo,heidelberg-university,heineken,heinz,hermes,hersheys,hilton,hm,home-depot,honda,hp,hsbc,huawei,hyatt,hyperx,hyundai,ibm,ikea,imperial-college-london,infiniti,insomniac-games,instacart,intel,inter-milan,io-interactive,isuzu,itch-io,jaguar,jdcom,jeep,johns-hopkins-university,johnson-johnson,jpmorgan-chase,juventus,kawasaki,kelloggs,kfc,kia,kings-college-london,koenigsegg,kohls,konami,kraft,kroger,ktm,ku-leuven,la-liga,lamborghini,lancia,land-rover,lavazza,lego,lenovo,levis,lexus,lidl,linkedin,liverpool-fc,logitech,logitech-g,loreal,lotus-cars,louis-vuitton,lowes,lucid-motors,lufthansa,lululemon,macys,mahindra,manchester-city,manchester-united,marriott,mars,marvel,maserati,mastercard,mattel,mazda,mcdonalds,mcgill-university,mclaren,mercedes-benz,merck,meta,mg-motor,miami-heat,michael-kors,microsoft,mini,mit,mitsubishi,mlb,moderna,mondelez,monster-energy,morgan-stanley,motogp,motorola,nascar,nba,nbcuniversal,nespresso,nestle,netflix,new-balance,new-york-knicks,new-york-rangers,new-york-university,new-york-yankees,nfl,nhl,nike,nikon,nintendo,nio,nissan,nokia,nordstrom,novartis,nvidia,ohio-state-university,old-navy,olympics,opel,oracle,orange,pagani,palantir,pampers,panasonic,paramount,paris-saint-germain,patagonia,paypal,peking-university,pepsi,peugeot,pfizer,pga-tour,philips,pixar,pizza-hut,playstation,polestar,porsche,prada,premier-league,procter-gamble,puma,purdue-university,qatar-airways,qualcomm,ralph-lauren,ram-trucks,razer,real-madrid,red-bull,red-bull-racing,reebok,remedy-entertainment,renault,rice-university,riot-games,rivian,roblox,roche,rockstar-games,rolls-royce,ryanair,salesforce,samsung,sanofi,santander,sap,saudi-aramco,seat,sega,seoul-national-university,sephora,serie-a,shell,shopify,singapore-airlines,skechers,skoda,sl-benfica,slack,smart,snapchat,sony,sony-pictures,sorbonne-university,southwest,spacex,spalding,speedo,spotify,square-enix,stanford-university,starbucks,steam,steelseries,stripe,subaru,subway,suzuki,t-mobile,taco-bell,target,tata-motors,technical-university-of-munich,tesco,tesla,the-north-face,tiktok,timberland,tj-maxx,tommy-hilfiger,toronto-maple-leafs,toshiba,totalenergies,tottenham-hotspur,toyota,tripadvisor,triumph-motorcycles,tu-delft,uber,ubisoft,ubs,uc-berkeley,ucl,ucla,uefa,ufc,ulta,under-armour,unilever,uniqlo,united-airlines,unity,universal-pictures,university-of-british-columbia,university-of-cambridge,university-of-chicago,university-of-copenhagen,university-of-hong-kong,university-of-oxford,university-of-pennsylvania,university-of-toronto,ups,urban-outfitters,valve,vans,vauxhall,verizon,versace,victorias-secret,vinfast,visa,vodafone,volkswagen,volvo,walmart,warner-bros,wells-fargo,wendys,whirlpool,whole-foods,wilson,wta,wwe,x,xbox,xerox,xiaomi,xpeng,yamaha-motor,yonex,zara,zeekr,zoom,zynga""".split(
        ","
    )
)

OUT = Path(__file__).parent / "new-brands-data.mjs"
TOTAL = 551

VALID_CATEGORIES = {
    "technology", "fashion", "food", "automotive", "retail", "finance",
    "airlines", "entertainment", "consumer-goods", "telecom", "sports",
    "healthcare", "energy", "ecommerce", "gaming", "universities",
}

TARGET = {
    "sports": 168,
    "gaming": 74,
    "technology": 31,
    "fashion": 31,
    "food": 29,
    "automotive": 32,
    "retail": 25,
    "finance": 25,
    "entertainment": 25,
    "consumer-goods": 20,
    "airlines": 15,
    "telecom": 12,
    "healthcare": 15,
    "energy": 10,
    "ecommerce": 15,
    "universities": 24,
}


def slugify(name: str) -> str:
    s = name.lower().replace("&", "and").replace("'", "")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def B(name, cat, country, color, slug=None, featured=False, icon=None, colorName=None):
    d = dict(name=name, slug=slug or slugify(name), category=cat, country=country, color=color)
    if featured:
        d["featured"] = True
    if icon:
        d["icon"] = icon
    if colorName:
        d["colorName"] = colorName
    return d


# fmt: off
RAW = []

# ── SPORTS (168) ──────────────────────────────────────────────────────────
RAW += [
    # National teams (priority)
    B("Brazil", "sports", "Brazil", "#009C3B", featured=True),
    B("England", "sports", "United Kingdom", "#CE1124", featured=True),
    B("Germany", "sports", "Germany", "#000000", featured=True),
    B("France", "sports", "France", "#002654", featured=True),
    B("Spain", "sports", "Spain", "#AA151B", featured=True),
    B("Italy", "sports", "Italy", "#009246", featured=True),
    B("Argentina", "sports", "Argentina", "#74ACDF", featured=True),
    B("Portugal", "sports", "Portugal", "#006600", featured=True),
    B("Netherlands", "sports", "Netherlands", "#FF6600", featured=True),
    B("Belgium", "sports", "Belgium", "#EF3340", featured=True),
    B("Croatia", "sports", "Croatia", "#FF0000", featured=True),
    B("Uruguay", "sports", "Uruguay", "#003DA5", featured=True),
    B("Mexico", "sports", "Mexico", "#006847", featured=True),
    B("USA", "sports", "United States", "#002868", slug="usa", featured=True),
    B("Japan", "sports", "Japan", "#BC002D", featured=True),
    B("South Korea", "sports", "South Korea", "#CD2E3A", featured=True),
    B("Norway", "sports", "Norway", "#BA0C2F", featured=True),
    B("Poland", "sports", "Poland", "#DC143C"),
    B("Sweden", "sports", "Sweden", "#006AA7"),
    B("Denmark", "sports", "Denmark", "#C8102E"),
    B("Switzerland", "sports", "Switzerland", "#FF0000"),
    B("Colombia", "sports", "Colombia", "#FCD116"),
    B("Senegal", "sports", "Senegal", "#00853F"),
    B("Morocco", "sports", "Morocco", "#C1272D"),
    B("Wales", "sports", "United Kingdom", "#D30731"),
    B("Scotland", "sports", "United Kingdom", "#0065BD"),
    # Premier League (priority)
    B("Crystal Palace", "sports", "United Kingdom", "#1B458F", featured=True),
    B("West Ham United", "sports", "United Kingdom", "#7A263A", slug="west-ham", featured=True),
    B("Everton", "sports", "United Kingdom", "#003399", featured=True),
    B("Newcastle United", "sports", "United Kingdom", "#241F20", slug="newcastle-united", featured=True),
    B("Aston Villa", "sports", "United Kingdom", "#95BFE5", featured=True),
    B("Brighton & Hove Albion", "sports", "United Kingdom", "#0057B8", slug="brighton"),
    B("Fulham", "sports", "United Kingdom", "#000000"),
    B("Brentford", "sports", "United Kingdom", "#E30613"),
    B("Nottingham Forest", "sports", "United Kingdom", "#DD0000", slug="nottingham-forest"),
    B("Wolverhampton Wanderers", "sports", "United Kingdom", "#FDB913", slug="wolves"),
    B("Leeds United", "sports", "United Kingdom", "#FFCD00", slug="leeds-united"),
    B("AFC Bournemouth", "sports", "United Kingdom", "#DA291C", slug="bournemouth"),
    B("Ipswich Town", "sports", "United Kingdom", "#003399", slug="ipswich-town"),
    B("Southampton", "sports", "United Kingdom", "#D71920"),
    B("Leicester City", "sports", "United Kingdom", "#003090", slug="leicester-city"),
    # Serie A (priority)
    B("Lazio", "sports", "Italy", "#87D8F7", featured=True),
    B("AS Roma", "sports", "Italy", "#8E1F2F", slug="as-roma", featured=True),
    B("Napoli", "sports", "Italy", "#12A0D7", featured=True),
    B("Fiorentina", "sports", "Italy", "#482E92", featured=True),
    B("Torino", "sports", "Italy", "#8B0000"),
    B("Atalanta", "sports", "Italy", "#1E71B8"),
    B("Bologna", "sports", "Italy", "#A21C26"),
    B("Udinese", "sports", "Italy", "#000000"),
    B("Genoa", "sports", "Italy", "#CC0000"),
    B("Cagliari", "sports", "Italy", "#00205B"),
    B("Empoli", "sports", "Italy", "#0066CC"),
    B("Parma", "sports", "Italy", "#FFED00"),
    # La Liga (priority)
    B("Sevilla", "sports", "Spain", "#D71920", featured=True),
    B("Valencia", "sports", "Spain", "#EE3524", featured=True),
    B("Villarreal", "sports", "Spain", "#FFE114", featured=True),
    B("Real Betis", "sports", "Spain", "#00954C"),
    B("Real Sociedad", "sports", "Spain", "#0067B1"),
    B("Athletic Bilbao", "sports", "Spain", "#EE2523"),
    B("Celta Vigo", "sports", "Spain", "#87CEEB"),
    B("Getafe", "sports", "Spain", "#005999"),
    B("Osasuna", "sports", "Spain", "#D91A21"),
    B("RCD Mallorca", "sports", "Spain", "#E30613", slug="rcd-mallorca"),
    # Bundesliga (priority)
    B("RB Leipzig", "sports", "Germany", "#DD0741", featured=True),
    B("Bayer Leverkusen", "sports", "Germany", "#E32221", slug="bayer-leverkusen", featured=True),
    B("Eintracht Frankfurt", "sports", "Germany", "#E1000F"),
    B("VfL Wolfsburg", "sports", "Germany", "#65B32E", slug="vfl-wolfsburg"),
    B("SC Freiburg", "sports", "Germany", "#E30613", slug="sc-freiburg"),
    B("TSG Hoffenheim", "sports", "Germany", "#1961AA", slug="tsg-hoffenheim"),
    B("FSV Mainz 05", "sports", "Germany", "#C8102E", slug="fsv-mainz"),
    B("FC Augsburg", "sports", "Germany", "#BA3733", slug="fc-augsburg"),
    B("VfL Bochum", "sports", "Germany", "#005CA9", slug="vfl-bochum"),
    B("FC St. Pauli", "sports", "Germany", "#6C4F3D", slug="fc-st-pauli"),
    # Ligue 1 (priority)
    B("Olympique Lyon", "sports", "France", "#002868", slug="olympique-lyon", featured=True),
    B("Olympique Marseille", "sports", "France", "#2FAEE0", slug="olympique-marseille", featured=True),
    B("AS Monaco", "sports", "France", "#E30613", slug="as-monaco", featured=True),
    B("LOSC Lille", "sports", "France", "#E30613", slug="losc-lille"),
    B("OGC Nice", "sports", "France", "#D71920", slug="ogc-nice"),
    B("RC Lens", "sports", "France", "#D71920", slug="rc-lens"),
    B("Stade Rennais", "sports", "France", "#E30613", slug="stade-rennais"),
    B("RC Strasbourg", "sports", "France", "#0055A4", slug="rc-strasbourg"),
    # Other football
    B("Sporting CP", "sports", "Portugal", "#008057", featured=True),
    B("Galatasaray", "sports", "Turkey", "#A90432", featured=True),
    B("Fenerbahce", "sports", "Turkey", "#FFED00"),
    B("Besiktas", "sports", "Turkey", "#000000"),
    B("Rangers FC", "sports", "United Kingdom", "#1B458F", slug="rangers-fc", featured=True),
    B("Shakhtar Donetsk", "sports", "Ukraine", "#FF6600", slug="shakhtar-donetsk"),
    B("Dynamo Kyiv", "sports", "Ukraine", "#005BBB"),
    B("Club Brugge", "sports", "Belgium", "#0066CC"),
    B("Red Star Belgrade", "sports", "Serbia", "#ED1C24"),
    B("Olympiacos", "sports", "Greece", "#E30613"),
    B("Panathinaikos", "sports", "Greece", "#006747"),
    B("SC Braga", "sports", "Portugal", "#E30613", slug="sc-braga"),
    B("Vitoria Guimaraes", "sports", "Portugal", "#FFFFFF", slug="vitoria-guimaraes"),
    B("Feyenoord", "sports", "Netherlands", "#E30613", featured=True),
    B("PSV Eindhoven", "sports", "Netherlands", "#ED1C24", featured=True),
    B("Ajax Amsterdam", "sports", "Netherlands", "#D2122E", slug="ajax-amsterdam"),
    # NBA teams
    B("Boston Celtics", "sports", "United States", "#007A33", featured=True),
    B("Los Angeles Lakers", "sports", "United States", "#552583", slug="los-angeles-lakers", featured=True),
    B("Chicago Bulls", "sports", "United States", "#CE1141", featured=True),
    B("Golden State Warriors", "sports", "United States", "#1D428A", slug="golden-state-warriors", featured=True),
    B("Brooklyn Nets", "sports", "United States", "#000000"),
    B("Philadelphia 76ers", "sports", "United States", "#006BB6", slug="philadelphia-76ers"),
    B("Milwaukee Bucks", "sports", "United States", "#00471B"),
    B("Denver Nuggets", "sports", "United States", "#0E2240"),
    B("Phoenix Suns", "sports", "United States", "#1D1160"),
    B("Dallas Mavericks", "sports", "United States", "#00538C"),
    B("Los Angeles Clippers", "sports", "United States", "#C8102E", slug="los-angeles-clippers"),
    B("San Antonio Spurs", "sports", "United States", "#C4CED4", slug="san-antonio-spurs"),
    B("Houston Rockets", "sports", "United States", "#CE1141"),
    B("Memphis Grizzlies", "sports", "United States", "#5D76A9"),
    B("Minnesota Timberwolves", "sports", "United States", "#0C2340", slug="minnesota-timberwolves"),
    B("Oklahoma City Thunder", "sports", "United States", "#007AC1", slug="oklahoma-city-thunder"),
    B("Portland Trail Blazers", "sports", "United States", "#E03A3E", slug="portland-trail-blazers"),
    B("Sacramento Kings", "sports", "United States", "#5A2D81"),
    B("Utah Jazz", "sports", "United States", "#002B5C"),
    B("Indiana Pacers", "sports", "United States", "#002D62"),
    B("Cleveland Cavaliers", "sports", "United States", "#860038"),
    B("Detroit Pistons", "sports", "United States", "#C8102E"),
    B("Orlando Magic", "sports", "United States", "#0077C0"),
    B("Washington Wizards", "sports", "United States", "#002B5C"),
    B("Atlanta Hawks", "sports", "United States", "#E03A3E"),
    B("Charlotte Hornets", "sports", "United States", "#1D1160"),
    B("Toronto Raptors", "sports", "Canada", "#CE1141", featured=True),
    # NHL teams
    B("Montreal Canadiens", "sports", "Canada", "#AF1E2D", featured=True),
    B("Toronto Maple Leafs", "sports", "Canada", "#00205B", slug="toronto-maple-leafs-nhl"),
    B("Boston Bruins", "sports", "United States", "#FFB81C"),
    B("Detroit Red Wings", "sports", "United States", "#CE1126"),
    B("Chicago Blackhawks", "sports", "United States", "#CF0A2C"),
    B("Pittsburgh Penguins", "sports", "United States", "#000000"),
    B("Edmonton Oilers", "sports", "Canada", "#041E42"),
    B("Calgary Flames", "sports", "Canada", "#C8102E"),
    B("Vancouver Canucks", "sports", "Canada", "#00205B"),
    B("Vegas Golden Knights", "sports", "United States", "#B4975A", featured=True),
    B("Seattle Kraken", "sports", "United States", "#001628"),
    B("Colorado Avalanche", "sports", "United States", "#6F263D"),
    B("Dallas Stars", "sports", "United States", "#006847"),
    B("Tampa Bay Lightning", "sports", "United States", "#002868"),
    B("Florida Panthers", "sports", "United States", "#041E42"),
    B("New Jersey Devils", "sports", "United States", "#CE1126"),
    B("Philadelphia Flyers", "sports", "United States", "#F74902"),
    B("Washington Capitals", "sports", "United States", "#C8102E"),
    # NFL teams
    B("Green Bay Packers", "sports", "United States", "#203731", featured=True),
    B("Dallas Cowboys", "sports", "United States", "#003594", featured=True),
    B("San Francisco 49ers", "sports", "United States", "#AA0000", slug="san-francisco-49ers", featured=True),
    B("Kansas City Chiefs", "sports", "United States", "#E31837", featured=True),
    B("New England Patriots", "sports", "United States", "#002244", slug="new-england-patriots", featured=True),
    B("Pittsburgh Steelers", "sports", "United States", "#FFB612"),
    B("Chicago Bears", "sports", "United States", "#0B162A"),
    B("Denver Broncos", "sports", "United States", "#FB4F14"),
    B("Seattle Seahawks", "sports", "United States", "#002244"),
    B("Baltimore Ravens", "sports", "United States", "#241773"),
    B("Buffalo Bills", "sports", "United States", "#00338D"),
    B("Philadelphia Eagles", "sports", "United States", "#004C54"),
    B("Las Vegas Raiders", "sports", "United States", "#000000"),
    B("Los Angeles Rams", "sports", "United States", "#003594", slug="los-angeles-rams"),
    B("Miami Dolphins", "sports", "United States", "#008E97"),
    B("Minnesota Vikings", "sports", "United States", "#4F2683"),
    # MLB teams
    B("New York Mets", "sports", "United States", "#002D72", featured=True),
    B("Boston Red Sox", "sports", "United States", "#BD3039", featured=True),
    B("Los Angeles Dodgers", "sports", "United States", "#005A9C", slug="los-angeles-dodgers", featured=True),
    B("Chicago Cubs", "sports", "United States", "#0E3386"),
    B("St. Louis Cardinals", "sports", "United States", "#C41E3A", slug="st-louis-cardinals"),
    B("San Francisco Giants", "sports", "United States", "#FD5A1E", slug="san-francisco-giants"),
    B("Atlanta Braves", "sports", "United States", "#CE1141"),
    B("Houston Astros", "sports", "United States", "#002D62"),
    B("Philadelphia Phillies", "sports", "United States", "#E81828"),
    # Other sports
    B("Williams Racing", "sports", "United Kingdom", "#005AFF", featured=True),
    B("Haas F1 Team", "sports", "United States", "#FFFFFF", slug="haas-f1"),
    B("Alpine F1 Team", "sports", "France", "#0090FF", slug="alpine-f1"),
    B("Sauber", "sports", "Switzerland", "#52E252", slug="sauber-f1"),
    B("ATP Tour", "sports", "United Kingdom", "#121212", featured=True),
    B("LPGA Tour", "sports", "United States", "#003DA5"),
    B("Tour de France", "sports", "France", "#FFFF00", featured=True),
    B("UCI", "sports", "Switzerland", "#0099D8"),
    B("World Rugby", "sports", "Ireland", "#00205B"),
    B("Cricket Australia", "sports", "Australia", "#FFCD00"),
    B("ICC", "sports", "United Arab Emirates", "#00205B"),
    B("Indian Premier League", "sports", "India", "#19398A", slug="ipl", featured=True),
]

# ── GAMING (74) ─────────────────────────────────────────────────────────────
RAW += [
    # Esports (priority)
    B("Team Vitality", "gaming", "France", "#FFEE00", featured=True),
    B("G2 Esports", "gaming", "Germany", "#000000", featured=True),
    B("Fnatic", "gaming", "United Kingdom", "#FF5900", featured=True),
    B("Team Liquid", "gaming", "Netherlands", "#0A1628", featured=True),
    B("Cloud9", "gaming", "United States", "#27AAE1", featured=True),
    B("T1", "gaming", "South Korea", "#E4002B", featured=True),
    B("FaZe Clan", "gaming", "United States", "#FF0000", featured=True),
    B("Natus Vincere", "gaming", "Ukraine", "#FFE500", slug="natus-vincere", featured=True),
    B("Evil Geniuses", "gaming", "United States", "#0C2340", featured=True),
    B("100 Thieves", "gaming", "United States", "#E50914", featured=True),
    B("TSM", "gaming", "United States", "#000000", featured=True),
    B("Gen.G", "gaming", "South Korea", "#AA8FFF", featured=True),
    B("DRX", "gaming", "South Korea", "#004098", featured=True),
    B("LOUD", "gaming", "Brazil", "#00FF00", featured=True),
    B("FURIA", "gaming", "Brazil", "#000000", featured=True),
    B("OG", "gaming", "Europe", "#A8A8A8", featured=True),
    B("Astralis", "gaming", "Denmark", "#FF0000", featured=True),
    B("MOUZ", "gaming", "Germany", "#FF0000", featured=True),
    B("Heroic", "gaming", "Denmark", "#E30613", featured=True),
    B("Complexity Gaming", "gaming", "United States", "#000000", slug="complexity-gaming"),
    B("Sentinels", "gaming", "United States", "#FF4655", featured=True),
    B("OpTic Gaming", "gaming", "United States", "#9D2235", featured=True),
    B("NRG Esports", "gaming", "United States", "#FF6600", featured=True),
    B("Guild Esports", "gaming", "United Kingdom", "#00D4AA", featured=True),
    B("Karmine Corp", "gaming", "France", "#0000FF", featured=True),
    B("Bilibili Gaming", "gaming", "China", "#00A1D6", featured=True),
    B("EDward Gaming", "gaming", "China", "#000000", slug="edward-gaming", featured=True),
    B("JD Gaming", "gaming", "China", "#E30613", featured=True),
    B("Weibo Gaming", "gaming", "China", "#E6162D", featured=True),
    B("Top Esports", "gaming", "China", "#E30613", featured=True),
    B("FunPlus Phoenix", "gaming", "China", "#E30613", featured=True),
    B("Royal Never Give Up", "gaming", "China", "#FFD700", slug="royal-never-give-up", featured=True),
    B("Invictus Gaming", "gaming", "China", "#000000", featured=True),
    B("Paper Rex", "gaming", "Singapore", "#FF0000", slug="paper-rex", featured=True),
    B("Team Secret", "gaming", "Philippines", "#000000", featured=True),
    B("Team Spirit", "gaming", "Russia", "#00BFFF", featured=True),
    B("Ninjas in Pyjamas", "gaming", "Sweden", "#FFE500", slug="ninjas-in-pyjamas", featured=True),
    B("Virtus.pro", "gaming", "Russia", "#F7941D", featured=True),
    B("GamerLegion", "gaming", "Germany", "#FF0000"),
    B("BIG", "gaming", "Germany", "#FFD700"),
    B("ENCE", "gaming", "Finland", "#003DA5"),
    B("M80", "gaming", "United States", "#000000"),
    B("Shopify Rebellion", "gaming", "Canada", "#96BF48", slug="shopify-rebellion"),
    B("Team Falcons", "gaming", "Saudi Arabia", "#00843D"),
    B("Team Heretics", "gaming", "Spain", "#FFD700"),
    B("KOI", "gaming", "Spain", "#E30613", featured=True),
    B("Movistar KOI", "gaming", "Spain", "#019DF4", slug="movistar-koi"),
    # Game studios / publishers
    B("Supercell", "gaming", "Finland", "#FFC800", featured=True),
    B("King", "gaming", "Sweden", "#FF0000", featured=True),
    B("Mojang Studios", "gaming", "Sweden", "#62B47A", featured=True),
    B("Naughty Dog", "gaming", "United States", "#000000", featured=True),
    B("Santa Monica Studio", "gaming", "United States", "#003791"),
    B("Guerrilla Games", "gaming", "Netherlands", "#000000"),
    B("Sucker Punch Productions", "gaming", "United States", "#000000", slug="sucker-punch"),
    B("Bungie", "gaming", "United States", "#0072CE", slug="bungie-studios"),
    B("343 Industries", "gaming", "United States", "#107C10"),
    B("Rare", "gaming", "United Kingdom", "#0078D4", featured=True),
    B("Playground Games", "gaming", "United Kingdom", "#107C10"),
    B("The Coalition", "gaming", "United States", "#107C10"),
    B("Turn 10 Studios", "gaming", "United States", "#107C10"),
    B("Playtika", "gaming", "Israel", "#FF6600"),
    B("Zynga", "gaming", "United States", "#E60012", slug="zynga-games"),
    B("Scopely", "gaming", "United States", "#FF6600", featured=True),
    B("Behaviour Interactive", "gaming", "Canada", "#000000"),
    B("Crytek", "gaming", "Germany", "#FF0000"),
    B("Techland", "gaming", "Poland", "#FF0000"),
    B("People Can Fly", "gaming", "Poland", "#FF6600"),
    B("Focus Entertainment", "gaming", "France", "#E30613"),
    B("Embracer Group", "gaming", "Sweden", "#000000"),
    B("THQ Nordic", "gaming", "Austria", "#FF0000"),
    B("Paradox Interactive", "gaming", "Sweden", "#0066CC", featured=True),
    B("Frontier Developments", "gaming", "United Kingdom", "#003DA5"),
    B("Creative Assembly", "gaming", "United Kingdom", "#000000"),
    B("Relic Entertainment", "gaming", "Canada", "#000000"),
    B("Firaxis Games", "gaming", "United States", "#003DA5"),
]

# ── TECHNOLOGY (44) ─────────────────────────────────────────────────────────
RAW += [
    B("Snowflake", "technology", "United States", "#29B5E8", featured=True, icon="snowflake"),
    B("Databricks", "technology", "United States", "#FF3621", featured=True),
    B("ServiceNow", "technology", "United States", "#81B5A1", featured=True, icon="servicenow"),
    B("Workday", "technology", "United States", "#005CB9", featured=True, icon="workday"),
    B("Atlassian", "technology", "Australia", "#0052CC", featured=True, icon="atlassian"),
    B("Twilio", "technology", "United States", "#F22F46", featured=True, icon="twilio"),
    B("Okta", "technology", "United States", "#007DC1", featured=True, icon="okta"),
    B("CrowdStrike", "technology", "United States", "#E01E5A", featured=True),
    B("Datadog", "technology", "United States", "#632CA6", featured=True, icon="datadog"),
    B("MongoDB", "technology", "United States", "#47A248", featured=True, icon="mongodb"),
    B("Elastic", "technology", "Netherlands", "#005571", featured=True, icon="elastic"),
    B("HashiCorp", "technology", "United States", "#000000", featured=True, icon="hashicorp"),
    B("Cloudflare", "technology", "United States", "#F38020", featured=True, icon="cloudflare"),
    B("Fastly", "technology", "United States", "#FF282D", icon="fastly"),
    B("Akamai", "technology", "United States", "#0099D8", featured=True, icon="akamai"),
    B("Vercel", "technology", "United States", "#000000", featured=True, icon="vercel"),
    B("Netlify", "technology", "United States", "#00C7B7", icon="netlify"),
    B("GitLab", "technology", "United States", "#FC6D26", featured=True, icon="gitlab"),
    B("JetBrains", "technology", "Czech Republic", "#000000", featured=True, icon="jetbrains"),
    B("Canonical", "technology", "United Kingdom", "#E95420", featured=True, icon="canonical"),
    B("Red Hat", "technology", "United States", "#EE0000", featured=True, icon="redhat"),
    B("SUSE", "technology", "Germany", "#0C322C", icon="suse"),
    B("VMware", "technology", "United States", "#607078", featured=True, icon="vmware"),
    B("Citrix", "technology", "United States", "#452170", icon="citrix"),
    B("Splunk", "technology", "United States", "#000000", featured=True, icon="splunk"),
    B("Palo Alto Networks", "technology", "United States", "#FA582D", featured=True),
    B("Fortinet", "technology", "United States", "#EE3124", featured=True, icon="fortinet"),
    B("Check Point", "technology", "Israel", "#EE3124"),
    B("Zscaler", "technology", "United States", "#0066CC"),
    B("SentinelOne", "technology", "United States", "#4C00FF"),
    B("Autodesk", "technology", "United States", "#0696D7", featured=True, icon="autodesk"),
    B("Ansys", "technology", "United States", "#FFB71B", icon="ansys"),
    B("PTC", "technology", "United States", "#0066CC"),
    B("Synopsys", "technology", "United States", "#5A2D82", icon="synopsys"),
    B("Cadence", "technology", "United States", "#003DA5"),
    B("Arm", "technology", "United Kingdom", "#0091BD", featured=True, icon="arm"),
    B("Broadcom", "technology", "United States", "#CC092F", featured=True, icon="broadcom"),
    B("Marvell", "technology", "United States", "#00205B"),
    B("Micron", "technology", "United States", "#007CC3", featured=True, icon="micron"),
    B("Western Digital", "technology", "United States", "#005195", icon="westerndigital"),
    B("Seagate", "technology", "United States", "#006747", icon="seagate"),
    B("Kingston", "technology", "United States", "#CC0000", icon="kingston"),
    B("Crucial", "technology", "United States", "#007CC3"),
]

# ── FASHION (39) ────────────────────────────────────────────────────────────
RAW += [
    B("Off-White", "fashion", "Italy", "#000000", featured=True),
    B("Supreme", "fashion", "United States", "#FF0000", featured=True),
    B("Stone Island", "fashion", "Italy", "#000000", featured=True),
    B("Moncler", "fashion", "Italy", "#003DA5", featured=True),
    B("Canada Goose", "fashion", "Canada", "#000000", featured=True),
    B("Arc'teryx", "fashion", "Canada", "#000000", featured=True),
    B("Salomon", "fashion", "France", "#000000", featured=True),
    B("Hoka", "fashion", "France", "#0066CC", featured=True),
    B("On Running", "fashion", "Switzerland", "#000000", slug="on-running", featured=True),
    B("Allbirds", "fashion", "United States", "#000000"),
    B("Veja", "fashion", "France", "#006633"),
    B("A.P.C.", "fashion", "France", "#000000", slug="apc"),
    B("Acne Studios", "fashion", "Sweden", "#000000", featured=True),
    B("Stussy", "fashion", "United States", "#000000", featured=True),
    B("Palace Skateboards", "fashion", "United Kingdom", "#000000", slug="palace-skateboards", featured=True),
    B("Bape", "fashion", "Japan", "#006633", featured=True),
    B("Comme des Garcons", "fashion", "Japan", "#000000", slug="comme-des-garcons", featured=True),
    B("Issey Miyake", "fashion", "Japan", "#000000", featured=True),
    B("Yohji Yamamoto", "fashion", "Japan", "#000000"),
    B("Kenzo", "fashion", "France", "#000000", featured=True),
    B("Givenchy", "fashion", "France", "#000000", featured=True),
    B("Saint Laurent", "fashion", "France", "#000000", featured=True),
    B("Celine", "fashion", "France", "#000000", featured=True),
    B("Loewe", "fashion", "Spain", "#000000", featured=True),
    B("Bottega Veneta", "fashion", "Italy", "#006633", featured=True),
    B("Valentino", "fashion", "Italy", "#CC0000", featured=True),
    B("Miu Miu", "fashion", "Italy", "#FFB6C1", featured=True),
    B("Fendi", "fashion", "Italy", "#FFD700", slug="fendi-fashion"),
    B("Missoni", "fashion", "Italy", "#FF6600"),
    B("Ermenegildo Zegna", "fashion", "Italy", "#000000", slug="zegna"),
    B("Brunello Cucinelli", "fashion", "Italy", "#8B7355"),
    B("Tod's", "fashion", "Italy", "#8B4513", slug="tods"),
    B("Ferragamo", "fashion", "Italy", "#CC0000", featured=True),
    B("Tory Burch", "fashion", "United States", "#003DA5", featured=True),
    B("Kate Spade", "fashion", "United States", "#FF69B4", featured=True),
    B("Coach", "fashion", "United States", "#000000", slug="coach-fashion"),
    B("Longchamp", "fashion", "France", "#000000"),
    B("Furla", "fashion", "Italy", "#CC0000"),
]

# ── FOOD (35) ───────────────────────────────────────────────────────────────
RAW += [
    B("Chipotle", "food", "United States", "#A81612", featured=True),
    B("Panera Bread", "food", "United States", "#006241", featured=True),
    B("Five Guys", "food", "United States", "#ED1C24", featured=True),
    B("Shake Shack", "food", "United States", "#006341", featured=True),
    B("In-N-Out Burger", "food", "United States", "#F7941D", featured=True),
    B("Popeyes", "food", "United States", "#FF6600", featured=True),
    B("Arby's", "food", "United States", "#D71920", slug="arbys"),
    B("Wingstop", "food", "United States", "#006633"),
    B("Panda Express", "food", "United States", "#E31837", featured=True),
    B("Olive Garden", "food", "United States", "#006633"),
    B("Red Lobster", "food", "United States", "#ED1C24"),
    B("Texas Roadhouse", "food", "United States", "#006633"),
    B("Outback Steakhouse", "food", "United States", "#CC0000"),
    B("Cheesecake Factory", "food", "United States", "#FFD700"),
    B("IHOP", "food", "United States", "#0066CC"),
    B("Denny's", "food", "United States", "#ED1C24", slug="dennys"),
    B("Waffle House", "food", "United States", "#FFD700"),
    B("Krispy Kreme", "food", "United States", "#006633", featured=True),
    B("Dunkin' Donuts", "food", "United States", "#FF671F", slug="dunkin-donuts", featured=True),
    B("Tim Hortons", "food", "Canada", "#C8102E", featured=True),
    B("Costa Coffee", "food", "United Kingdom", "#6F263D", featured=True),
    B("Pret A Manger", "food", "United Kingdom", "#8B0000", featured=True),
    B("Greggs", "food", "United Kingdom", "#0066CC"),
    B("Jollibee", "food", "Philippines", "#E31837", featured=True),
    B("Lotus Biscoff", "food", "Belgium", "#D4AF37", featured=True),
    B("Oreo", "food", "United States", "#003DA5", featured=True),
    B("Pringles", "food", "United States", "#ED1C24", featured=True),
    B("Lay's", "food", "United States", "#FFD700", slug="lays"),
    B("Doritos", "food", "United States", "#ED1C24", featured=True),
    B("Ben & Jerry's", "food", "United States", "#006633", slug="ben-and-jerrys", featured=True),
    B("Haagen-Dazs", "food", "United States", "#8B0000", slug="haagen-dazs", featured=True),
    B("Magnum", "food", "Netherlands", "#FFD700", featured=True),
    B("Red Bull", "food", "Austria", "#003DA5", slug="red-bull-beverage"),
    B("Monster Beverage", "food", "United States", "#86BC25", slug="monster-beverage"),
]

# ── AUTOMOTIVE (35) ─────────────────────────────────────────────────────────
RAW += [
    B("Genesis", "automotive", "South Korea", "#000000", featured=True),
    B("Cupra", "automotive", "Spain", "#B0AFAF", featured=True),
    B("Alpine", "automotive", "France", "#0090FF", slug="alpine-cars", featured=True),
    B("Ineos Automotive", "automotive", "United Kingdom", "#000000", slug="ineos-automotive"),
    B("Rimac", "automotive", "Croatia", "#000000", featured=True),
    B("Pininfarina", "automotive", "Italy", "#003DA5"),
    B("Karma Automotive", "automotive", "United States", "#000000"),
    B("Fisker", "automotive", "United States", "#000000"),
    B("Canoo", "automotive", "United States", "#006633"),
    B("Lordstown Motors", "automotive", "United States", "#003DA5", slug="lordstown-motors"),
    B("Nikola", "automotive", "United States", "#006633"),
    B("Proterra", "automotive", "United States", "#006633"),
    B("Arrival", "automotive", "United Kingdom", "#000000"),
    B("Aptera", "automotive", "United States", "#006633"),
    B("Hennessey", "automotive", "United States", "#CC0000"),
    B("SSC North America", "automotive", "United States", "#000000", slug="ssc-north-america"),
    B("Spyker", "automotive", "Netherlands", "#CC0000"),
    B("W Motors", "automotive", "United Arab Emirates", "#000000", slug="w-motors"),
    B("GMC", "automotive", "United States", "#CC0000", featured=True),
    B("Scion", "automotive", "United States", "#000000"),
    B("Saturn", "automotive", "United States", "#006633"),
    B("Pontiac", "automotive", "United States", "#CC0000"),
    B("Hummer", "automotive", "United States", "#FFD700", featured=True),
    B("Rivian Automotive", "automotive", "United States", "#FFD700", slug="rivian-automotive"),
    B("Polestar Automotive", "automotive", "Sweden", "#FFD700", slug="polestar-automotive"),
    B("NIO Auto", "automotive", "China", "#0099FF", slug="nio-auto", featured=True),
    B("Li Auto", "automotive", "China", "#006633", featured=True),
    B("Great Wall Motors", "automotive", "China", "#CC0000", featured=True),
    B("Chery Auto", "automotive", "China", "#CC0000", slug="chery-auto"),
    B("Geely Auto", "automotive", "China", "#003DA5", slug="geely-auto"),
    B("SAIC Motor", "automotive", "China", "#003DA5", featured=True),
    B("Changan", "automotive", "China", "#003DA5"),
    B("BAIC", "automotive", "China", "#CC0000"),
    B("GAC", "automotive", "China", "#003DA5"),
]

# ── RETAIL (25) ─────────────────────────────────────────────────────────────
RAW += [
    B("Primark", "retail", "Ireland", "#003DA5", featured=True),
    B("Decathlon", "retail", "France", "#0082C3", featured=True),
    B("Walmart Canada", "retail", "Canada", "#0071CE", slug="walmart-canada"),
    B("Auchan", "retail", "France", "#ED1C24", featured=True),
    B("Metro AG", "retail", "Germany", "#003DA5", slug="metro-ag"),
    B("Rewe", "retail", "Germany", "#CC0000", featured=True),
    B("Edeka", "retail", "Germany", "#FFD700", featured=True),
    B("Penny", "retail", "Germany", "#CC0000"),
    B("Netto", "retail", "Germany", "#FFD700"),
    B("Morrisons", "retail", "United Kingdom", "#FFD700", featured=True),
    B("Sainsbury's", "retail", "United Kingdom", "#F58025", slug="sainsburys", featured=True),
    B("Waitrose", "retail", "United Kingdom", "#006633", featured=True),
    B("Marks & Spencer", "retail", "United Kingdom", "#006633", slug="marks-and-spencer", featured=True),
    B("John Lewis", "retail", "United Kingdom", "#000000", featured=True),
    B("Selfridges", "retail", "United Kingdom", "#FFD700", featured=True),
    B("Harrods", "retail", "United Kingdom", "#006633", featured=True),
    B("Liberty London", "retail", "United Kingdom", "#006633", slug="liberty-london"),
    B("Dillard's", "retail", "United States", "#CC0000", slug="dillards"),
    B("Belk", "retail", "United States", "#003DA5"),
    B("Bloomingdale's", "retail", "United States", "#000000", slug="bloomingdales", featured=True),
    B("Neiman Marcus", "retail", "United States", "#000000", featured=True),
    B("Saks Fifth Avenue", "retail", "United States", "#000000", slug="saks-fifth-avenue", featured=True),
    B("Dollar Tree", "retail", "United States", "#006633", featured=True),
    B("Family Dollar", "retail", "United States", "#CC0000"),
    B("Five Below", "retail", "United States", "#006633", featured=True),
]

# ── FINANCE (25) ────────────────────────────────────────────────────────────
RAW += [
    B("Revolut", "finance", "United Kingdom", "#0075EB", featured=True, icon="revolut"),
    B("Monzo", "finance", "United Kingdom", "#FF4B4B", featured=True, icon="monzo"),
    B("N26", "finance", "Germany", "#36A18B", featured=True, icon="n26"),
    B("Chime", "finance", "United States", "#00D395", featured=True),
    B("Robinhood", "finance", "United States", "#00C805", featured=True, icon="robinhood"),
    B("SoFi", "finance", "United States", "#00A1DF", featured=True),
    B("Affirm", "finance", "United States", "#0FAEE9", featured=True),
    B("Klarna", "finance", "Sweden", "#FFB3C7", featured=True, icon="klarna"),
    B("Afterpay", "finance", "Australia", "#B2FCE4", featured=True, icon="afterpay"),
    B("Adyen", "finance", "Netherlands", "#0ABF53", featured=True, icon="adyen"),
    B("Wise", "finance", "United Kingdom", "#9FE870", featured=True, icon="wise"),
    B("Nubank", "finance", "Brazil", "#820AD1", featured=True, icon="nubank"),
    B("Inter", "finance", "Brazil", "#FF7A00", featured=True, icon="bancointer"),
    B("Itau", "finance", "Brazil", "#EC7000", featured=True, slug="itau"),
    B("Bradesco", "finance", "Brazil", "#CC092F", featured=True),
    B("BBVA", "finance", "Spain", "#004481", featured=True, icon="bbva"),
    B("CaixaBank", "finance", "Spain", "#0075BE", featured=True),
    B("ING", "finance", "Netherlands", "#FF6200", featured=True, icon="ing"),
    B("Rabobank", "finance", "Netherlands", "#FF6600", icon="rabobank"),
    B("Nordea", "finance", "Finland", "#0000A0", icon="nordea"),
    B("SEB", "finance", "Sweden", "#006633"),
    B("Swedbank", "finance", "Sweden", "#FF6600"),
    B("Danske Bank", "finance", "Denmark", "#003DA5", icon="danskebank"),
    B("Credit Agricole", "finance", "France", "#009639", slug="credit-agricole", featured=True),
    B("BNP Paribas", "finance", "France", "#00915A", featured=True, icon="bnpparibas"),
]

# ── ENTERTAINMENT (25) ──────────────────────────────────────────────────────
RAW += [
    B("Crunchyroll", "entertainment", "United States", "#F47521", featured=True, icon="crunchyroll"),
    B("Funimation", "entertainment", "United States", "#410099"),
    B("Peacock", "entertainment", "United States", "#000000", featured=True),
    B("Discovery+", "entertainment", "United States", "#0047AB", slug="discovery-plus"),
    B("Max", "entertainment", "United States", "#002BE7", featured=True),
    B("Apple TV+", "entertainment", "United States", "#000000", slug="apple-tv-plus", featured=True),
    B("Amazon Prime Video", "entertainment", "United States", "#00A8E1", slug="amazon-prime-video", featured=True),
    B("Hulu", "entertainment", "United States", "#1CE783", featured=True, icon="hulu"),
    B("Twitch", "entertainment", "United States", "#9146FF", featured=True, icon="twitch"),
    B("Kick", "entertainment", "United States", "#53FC18", featured=True),
    B("SoundCloud", "entertainment", "Germany", "#FF5500", featured=True, icon="soundcloud"),
    B("Deezer", "entertainment", "France", "#FEAA2D", featured=True, icon="deezer"),
    B("Tidal", "entertainment", "Norway", "#000000", featured=True, icon="tidal"),
    B("Audible", "entertainment", "United States", "#F8991C", featured=True, icon="audible"),
    B("Penguin Random House", "entertainment", "United States", "#FF6600", slug="penguin-random-house", featured=True),
    B("HarperCollins", "entertainment", "United States", "#003DA5", featured=True),
    B("Simon & Schuster", "entertainment", "United States", "#CC0000", slug="simon-and-schuster"),
    B("Macmillan", "entertainment", "United States", "#003DA5"),
    B("Hachette", "entertainment", "France", "#CC0000"),
    B("Live Nation", "entertainment", "United States", "#CC0000", featured=True),
    B("AEG", "entertainment", "United States", "#CC0000", featured=True),
    B("Ticketmaster", "entertainment", "United States", "#026CDF", featured=True, icon="ticketmaster"),
    B("StubHub", "entertainment", "United States", "#3B5998"),
    B("Eventbrite", "entertainment", "United States", "#F05537", icon="eventbrite"),
    B("AMC Theatres", "entertainment", "United States", "#CC0000", slug="amc-theatres", featured=True),
]

# ── CONSUMER GOODS (20) ─────────────────────────────────────────────────────
RAW += [
    B("Method", "consumer-goods", "United States", "#006633"),
    B("Seventh Generation", "consumer-goods", "United States", "#006633", slug="seventh-generation"),
    B("Mrs. Meyer's", "consumer-goods", "United States", "#006633", slug="mrs-meyers"),
    B("Burt's Bees", "consumer-goods", "United States", "#FFD700", slug="burts-bees", featured=True),
    B("Nivea", "consumer-goods", "Germany", "#003DA5", featured=True, icon="nivea"),
    B("L'Oreal Paris", "consumer-goods", "France", "#000000", slug="loreal-paris", featured=True),
    B("Maybelline", "consumer-goods", "United States", "#000000", featured=True),
    B("Revlon", "consumer-goods", "United States", "#CC0000", featured=True),
    B("Clinique", "consumer-goods", "United States", "#006633", featured=True),
    B("Estee Lauder", "consumer-goods", "United States", "#003DA5", slug="estee-lauder", featured=True),
    B("MAC Cosmetics", "consumer-goods", "Canada", "#000000", slug="mac-cosmetics", featured=True),
    B("Fenty Beauty", "consumer-goods", "United States", "#000000", featured=True),
    B("Glossier", "consumer-goods", "United States", "#FFB6C1", featured=True),
    B("Olaplex", "consumer-goods", "United States", "#000000", featured=True),
    B("Kiehl's", "consumer-goods", "United States", "#000000", slug="kiehls", featured=True),
    B("Aveda", "consumer-goods", "United States", "#006633"),
    B("Bath & Body Works", "consumer-goods", "United States", "#CC0000", slug="bath-and-body-works", featured=True),
    B("Yankee Candle", "consumer-goods", "United States", "#CC0000", slug="yankee-candle", featured=True),
    B("Scotch", "consumer-goods", "United States", "#CC0000", featured=True),
    B("Post-it", "consumer-goods", "United States", "#FFD700", featured=True),
]

# ── AIRLINES (15) ───────────────────────────────────────────────────────────
RAW += [
    B("JetBlue", "airlines", "United States", "#003DA5", featured=True, icon="jetblue"),
    B("Alaska Airlines", "airlines", "United States", "#01426A", featured=True, icon="alaskaairlines"),
    B("Spirit Airlines", "airlines", "United States", "#FFD700", slug="spirit-airlines"),
    B("Frontier Airlines", "airlines", "United States", "#006633", slug="frontier-airlines"),
    B("Allegiant Air", "airlines", "United States", "#003DA5", slug="allegiant-air"),
    B("Hawaiian Airlines", "airlines", "United States", "#CC0000", slug="hawaiian-airlines"),
    B("Air Canada", "airlines", "Canada", "#F01428", featured=True, icon="aircanada"),
    B("WestJet", "airlines", "Canada", "#00843D", featured=True, icon="westjet"),
    B("Air Transat", "airlines", "Canada", "#003DA5"),
    B("Porter Airlines", "airlines", "Canada", "#003DA5"),
    B("Norwegian Air", "airlines", "Norway", "#D81921", featured=True, icon="norwegian"),
    B("Finnair", "airlines", "Finland", "#0B1560", featured=True, icon="finnair"),
    B("SAS", "airlines", "Sweden", "#003DA5", featured=True, icon="sas"),
    B("Iberia", "airlines", "Spain", "#CC0000", featured=True, icon="iberia"),
    B("Vueling", "airlines", "Spain", "#FFD700", icon="vueling"),
]

# ── TELECOM (12) ────────────────────────────────────────────────────────────
RAW += [
    B("Telefonica", "telecom", "Spain", "#0066CC", featured=True, icon="telefonica"),
    B("Telecom Italia", "telecom", "Italy", "#003DA5", featured=True, slug="telecom-italia"),
    B("Swisscom", "telecom", "Switzerland", "#003DA5", featured=True, icon="swisscom"),
    B("Telstra", "telecom", "Australia", "#FF6600", featured=True, icon="telstra"),
    B("Optus", "telecom", "Australia", "#006633", icon="optus"),
    B("Rogers", "telecom", "Canada", "#CC0000", featured=True, icon="rogers"),
    B("Bell Canada", "telecom", "Canada", "#003DA5", slug="bell-canada", featured=True),
    B("Telus", "telecom", "Canada", "#4B286D", featured=True, icon="telus"),
    B("SK Telecom", "telecom", "South Korea", "#EA0029", featured=True, slug="sk-telecom"),
    B("KT Corporation", "telecom", "South Korea", "#000000", slug="kt-corporation"),
    B("LG Uplus", "telecom", "South Korea", "#CC0000", slug="lg-uplus"),
    B("Reliance Jio", "telecom", "India", "#006633", featured=True, slug="reliance-jio"),
]

# ── HEALTHCARE (15) ─────────────────────────────────────────────────────────
RAW += [
    B("BioNTech", "healthcare", "Germany", "#003DA5", featured=True),
    B("Regeneron", "healthcare", "United States", "#003DA5", featured=True),
    B("Gilead Sciences", "healthcare", "United States", "#CC0000", slug="gilead-sciences", featured=True),
    B("Biogen", "healthcare", "United States", "#006633", featured=True),
    B("Amgen", "healthcare", "United States", "#0066CC", featured=True, icon="amgen"),
    B("Illumina", "healthcare", "United States", "#FF6600", featured=True),
    B("Thermo Fisher", "healthcare", "United States", "#CC0000", slug="thermo-fisher", featured=True),
    B("Danaher", "healthcare", "United States", "#003DA5", featured=True),
    B("AbbVie", "healthcare", "United States", "#071D49", featured=True, icon="abbvie"),
    B("Bristol-Myers Squibb", "healthcare", "United States", "#BE0028", slug="bristol-myers-squibb", featured=True),
    B("Eli Lilly", "healthcare", "United States", "#CC0000", slug="eli-lilly", featured=True),
    B("Boehringer Ingelheim", "healthcare", "Germany", "#003DA5", slug="boehringer-ingelheim", featured=True),
    B("Takeda", "healthcare", "Japan", "#CC0000", featured=True),
    B("CSL", "healthcare", "Australia", "#CC0000", featured=True),
    B("Fresenius", "healthcare", "Germany", "#003DA5", featured=True),
]

# ── ENERGY (10) ─────────────────────────────────────────────────────────────
RAW += [
    B("Eni", "energy", "Italy", "#FFD700", featured=True, icon="eni"),
    B("Repsol", "energy", "Spain", "#FF6600", featured=True, icon="repsol"),
    B("Equinor", "energy", "Norway", "#E30613", featured=True, icon="equinor"),
    B("Enbridge", "energy", "Canada", "#CC0000", featured=True),
    B("TC Energy", "energy", "Canada", "#003DA5", slug="tc-energy"),
    B("Occidental Petroleum", "energy", "United States", "#CC0000", slug="occidental-petroleum"),
    B("Devon Energy", "energy", "United States", "#CC0000", slug="devon-energy"),
    B("Pioneer Natural Resources", "energy", "United States", "#003DA5", slug="pioneer-natural-resources"),
    B("NextEra Energy", "energy", "United States", "#006633", featured=True),
    B("Iberdrola", "energy", "Spain", "#00A651", featured=True, icon="iberdrola"),
]

# ── ECOMMERCE (15) ──────────────────────────────────────────────────────────
RAW += [
    B("Mercado Libre", "ecommerce", "Argentina", "#FFE600", featured=True, icon="mercadolibre"),
    B("Rakuten", "ecommerce", "Japan", "#BF0000", featured=True, icon="rakuten"),
    B("Flipkart", "ecommerce", "India", "#2874F0", featured=True),
    B("Meituan", "ecommerce", "China", "#FFD100", featured=True),
    B("Pinduoduo", "ecommerce", "China", "#E02E24", featured=True),
    B("Shein", "ecommerce", "China", "#000000", featured=True),
    B("Temu", "ecommerce", "China", "#FF6600", featured=True),
    B("Wish", "ecommerce", "United States", "#2FB7EC", featured=True),
    B("Wayfair", "ecommerce", "United States", "#7B189F", featured=True, icon="wayfair"),
    B("Chewy", "ecommerce", "United States", "#1C49C2", featured=True),
    B("Farfetch", "ecommerce", "United Kingdom", "#000000", featured=True, icon="farfetch"),
    B("Zalando", "ecommerce", "Germany", "#FF6900", featured=True, icon="zalando"),
    B("Otto", "ecommerce", "Germany", "#CC0000", featured=True),
    B("Bol.com", "ecommerce", "Netherlands", "#0000FF", featured=True, slug="bol-com"),
    B("Cdiscount", "ecommerce", "France", "#CC0000", featured=True),
]

# ── UNIVERSITIES (24) ───────────────────────────────────────────────────────
RAW += [
    B("Harvard University", "universities", "United States", "#A51C30", featured=True, slug="harvard-university"),
    B("Yale University", "universities", "United States", "#00356B", featured=True, slug="yale-university"),
    B("Princeton University", "universities", "United States", "#E77500", featured=True, slug="princeton-university"),
    B("Columbia University", "universities", "United States", "#B9D9EB", featured=True, slug="columbia-university"),
    B("University of Michigan", "universities", "United States", "#00274C", slug="university-of-michigan", featured=True),
    B("Northwestern University", "universities", "United States", "#4E2A84", slug="northwestern-university", featured=True),
    B("Duke University", "universities", "United States", "#003087", slug="duke-university-new"),
    B("University of Virginia", "universities", "United States", "#232D4B", slug="university-of-virginia", featured=True),
    B("University of Notre Dame", "universities", "United States", "#0C2340", slug="university-of-notre-dame", featured=True),
    B("University of Texas at Austin", "universities", "United States", "#BF5700", slug="university-of-texas-austin", featured=True),
    B("University of Washington", "universities", "United States", "#4B2E83", slug="university-of-washington", featured=True),
    B("University of Wisconsin", "universities", "United States", "#C5050C", slug="university-of-wisconsin"),
    B("University of Illinois", "universities", "United States", "#13294B", slug="university-of-illinois", featured=True),
    B("University of Southern California", "universities", "United States", "#990000", slug="university-of-southern-california", featured=True),
    B("University of Edinburgh", "universities", "United Kingdom", "#003865", slug="university-of-edinburgh", featured=True),
    B("University of Manchester", "universities", "United Kingdom", "#660099", slug="university-of-manchester", featured=True),
    B("University of Warwick", "universities", "United Kingdom", "#552D80", slug="university-of-warwick"),
    B("University of Bristol", "universities", "United Kingdom", "#B01C2E", slug="university-of-bristol"),
    B("ETH Zurich", "universities", "Switzerland", "#0078A0", featured=True, slug="eth-zurich"),
    B("University of Melbourne", "universities", "Australia", "#003DA5", slug="university-of-melbourne", featured=True),
    B("University of Sydney", "universities", "Australia", "#E64626", slug="university-of-sydney", featured=True),
    B("University of Tokyo", "universities", "Japan", "#003DA5", slug="university-of-tokyo", featured=True),
    B("Tsinghua University", "universities", "China", "#660066", slug="tsinghua-university", featured=True),
    B("Peking University", "universities", "China", "#8B0000", slug="peking-university-new"),
]
# fmt: on


def validate_and_trim(brands: list) -> tuple[list, list]:
    """Deduplicate, filter conflicts, trim/pad to exact TOTAL."""
    issues = []
    seen = set()
    clean = []

    for b in brands:
        slug = b["slug"]
        if slug in EXISTING:
            issues.append(f"conflict with existing: {slug}")
            continue
        if slug in seen:
            issues.append(f"duplicate slug skipped: {slug}")
            continue
        if b["category"] not in VALID_CATEGORIES:
            issues.append(f"invalid category: {slug} -> {b['category']}")
            continue
        if not re.fullmatch(r"#[0-9A-Fa-f]{6}", b["color"]):
            issues.append(f"invalid color: {slug} -> {b['color']}")
            continue
        seen.add(slug)
        clean.append(b)

    # Trim to category targets first, then overall TOTAL
    by_cat = {}
    for b in clean:
        by_cat.setdefault(b["category"], []).append(b)

    final = []
    for cat, target in TARGET.items():
        items = by_cat.get(cat, [])
        if len(items) > target:
            final.extend(items[:target])
        else:
            final.extend(items)
            if len(items) < target:
                issues.append(f"shortfall in {cat}: have {len(items)}, need {target}")

    if len(final) != TOTAL:
        issues.append(f"total mismatch: have {len(final)}, need {TOTAL}")

    return final, issues


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def fmt_brand(b: dict) -> str:
    parts = [
        f"name: '{esc(b['name'])}'",
        f"slug: '{esc(b['slug'])}'",
        f"category: '{esc(b['category'])}'",
        f"country: '{esc(b['country'])}'",
        f"color: '{esc(b['color'])}'",
    ]
    if b.get("featured"):
        parts.append("featured: true")
    if b.get("icon"):
        parts.append(f"icon: '{esc(b['icon'])}'")
    if b.get("colorName"):
        parts.append(f"colorName: '{esc(b['colorName'])}'")
    return "  { " + ", ".join(parts) + " }"


def write_mjs(brands: list) -> None:
    lines = ["export const NEW_BRANDS = ["]
    for i, b in enumerate(brands):
        comma = "," if i < len(brands) - 1 else ""
        lines.append(fmt_brand(b) + comma)
    lines.append("]")
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    brands, issues = validate_and_trim(RAW)
    write_mjs(brands)

    counts = Counter(b["category"] for b in brands)
    slugs = [b["slug"] for b in brands]

    print(f"Wrote {OUT}")
    print(f"Total entries: {len(brands)} (target: {TOTAL})")
    print("Category breakdown:")
    for cat in sorted(TARGET):
        print(f"  {cat}: {counts.get(cat, 0)} (target: {TARGET[cat]})")
    print(f"Duplicate slugs in output: {len(slugs) - len(set(slugs))}")
    print(f"Conflicts with existing: {len(set(slugs) & EXISTING)}")
    invalid_cats = [b for b in brands if b["category"] not in VALID_CATEGORIES]
    invalid_colors = [b for b in brands if not re.fullmatch(r"#[0-9A-Fa-f]{6}", b["color"])]
    print(f"Invalid categories: {len(invalid_cats)}")
    print(f"Invalid colors: {len(invalid_colors)}")
    if issues:
        print("Issues:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("No issues found.")


if __name__ == "__main__":
    main()
