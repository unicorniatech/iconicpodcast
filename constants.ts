
import { PodcastEpisode, Translation, Language } from './types';

export const ZUZZI_HERO_IMAGE = "/mainhero.jpg"; 

export const TRANSLATIONS: Record<Language, Translation> = {
  'cs-CZ': {
    nav_home: 'Domů',
    nav_episodes: 'Epizody',
    nav_about: 'O Zuzaně',
    nav_contact: 'Kontakt',
    nav_crm: 'CRM Login',
    hero_title: 'Podcast #1 pro ženy, které chtějí víc',
    hero_subtitle: 'Poslech podcastu ICONIC je jako káva s mentorkou, která tě nenechá hrát při zdi. Zuzana Husárová ti ukáže, jak být svá a ikonická.',
    hero_cta: 'Poslechnout nejnovější díl',
    hero_kicker: 'The Iconic Podcast',
    hero_spotify_btn: 'Spotify',
    latest_episodes: 'Nejnovější Epizody',
    search_placeholder: 'Hledat epizodu...',
    no_episodes_found: 'Nebyly nalezeny žádné epizody.',
    filter_all: 'Vše',
    listen_on: 'Poslouchejte na',
    episode_about_title: 'O epizodě',
    episode_description_suffix: 'Poslouchejte tuto epizodu a zjistěte více o tom, jak být ikonická ve svém podnikání i osobním životě. Zuzana sdílí své osobní zkušenosti, pády i vzestupy.',
    listen_button: 'Poslechnout',
    contact_title: 'Kontaktujte nás',
    contact_subtitle: 'Máte dotaz, zájem o spolupráci nebo feedback? Napište nám.',
    contact_info_title: 'Kontaktní údaje',
    contact_email: 'Email',
    contact_phone: 'Telefon',
    contact_instagram: 'Instagram',
    contact_success_title: 'Zpráva odeslána!',
    contact_success_msg: 'Děkujeme za váš zájem. Brzy se vám ozveme.',
    form_name: 'Jméno',
    form_email: 'Email',
    form_phone: 'Telefon',
    form_message: 'Zpráva',
    form_submit: 'Odeslat Zprávu',
    footer_desc: 'Podcast pro ženy, které chtějí víc. Business, mindset a lifestyle bez kompromisů.',
    footer_menu: 'Menu',
    footer_contact: 'Kontakt',
    footer_location: 'Praha, Česká republika',
    footer_rights: 'Všechna práva vyhrazena.',
    chatbot_welcome: 'Ahoj! Jsem AI asistentka ICONIC. Jak ti mohu pomoci nastartovat tvou cestu?',
    chatbot_starters: ["Chci nastartovat byznys 🚀", "Hledám inspiraci ✨", "Spolupráce se Zuzkou 🤝", "Jak na sebedůvěru? 💖"],
    crm_title: 'ICONIC CRM Dashboard',
    crm_leads: 'Získané Kontakty',
    placeholder_loading: 'Načítám...',
    newsletter_title: 'Přidej se do ICONIC klubu',
    newsletter_desc: 'Získej týdenní dávku inspirace a VIP pozvánky přímo do e-mailu.',
    newsletter_placeholder: 'Tvůj email',
    newsletter_btn: 'Chci být u toho',
    newsletter_success: 'Vítej v klubu! 🥂',
    guest_modal_title: 'Chceš být vidět?',
    guest_modal_desc: 'Staň se hostem našeho podcastu a ukaž světu svou vizi a podnikatelský přesah.',
    guest_modal_btn: 'Mám zájem být hostem',
    guest_modal_success: 'Skvělé! Brzy se ti ozveme.',
    menu_profile: 'Profil',
    menu_sign_in: 'Přihlásit se',
    menu_sign_out: 'Odhlásit se',
    menu_language: 'Jazyk'
  },
  'en-US': {
    nav_home: 'Home',
    nav_episodes: 'Episodes',
    nav_about: 'About',
    nav_contact: 'Contact',
    nav_crm: 'CRM Login',
    hero_title: 'The #1 Podcast for Women Who Want More',
    hero_subtitle: 'Listening to the Iconic Podcast is like having coffee with a mentor who wont let you play small. Zuzana Husarova shows you how to be yourself and iconic.',
    hero_cta: 'Listen to Latest',
    hero_kicker: 'The Iconic Podcast',
    hero_spotify_btn: 'Spotify',
    latest_episodes: 'Latest Episodes',
    search_placeholder: 'Search episodes...',
    no_episodes_found: 'No episodes found.',
    filter_all: 'All',
    listen_on: 'Listen on',
    episode_about_title: 'About Episode',
    episode_description_suffix: 'Listen to this episode and find out more about how to be iconic in your business and personal life. Zuzana shares her personal experiences, ups and downs.',
    listen_button: 'Listen',
    contact_title: 'Contact Us',
    contact_subtitle: 'Have a question, interest in cooperation, or feedback? Write to us.',
    contact_info_title: 'Contact Info',
    contact_email: 'Email',
    contact_phone: 'Phone',
    contact_instagram: 'Instagram',
    contact_success_title: 'Message Sent!',
    contact_success_msg: 'Thank you for your interest. We will be in touch soon.',
    form_name: 'Name',
    form_email: 'Email',
    form_phone: 'Phone',
    form_message: 'Message',
    form_submit: 'Send Message',
    footer_desc: 'A podcast for women who want more. Business, mindset, and lifestyle without compromise.',
    footer_menu: 'Menu',
    footer_contact: 'Contact',
    footer_location: 'Prague, Czech Republic',
    footer_rights: 'All rights reserved.',
    chatbot_welcome: 'Hi! I am the ICONIC AI assistant. How can I help you start your journey?',
    chatbot_starters: ["Start a business 🚀", "Looking for inspiration ✨", "Work with Zuzka 🤝", "Boost confidence 💖"],
    crm_title: 'ICONIC CRM Dashboard',
    crm_leads: 'Captured Leads',
    placeholder_loading: 'Loading...',
    newsletter_title: 'Join the ICONIC Club',
    newsletter_desc: 'Get your weekly dose of inspiration and VIP invites straight to your inbox.',
    newsletter_placeholder: 'Your email',
    newsletter_btn: 'Join Now',
    newsletter_success: 'Welcome to the club! 🥂',
    guest_modal_title: 'Want to be seen?',
    guest_modal_desc: 'Become a guest on our podcast and show the world your vision and entrepreneurial reach.',
    guest_modal_btn: 'I want to be a guest',
    guest_modal_success: 'Great! We will contact you soon.',
    menu_profile: 'Profile',
    menu_sign_in: 'Sign In',
    menu_sign_out: 'Sign Out',
    menu_language: 'Language'
  },
  'es-MX': {
    nav_home: 'Inicio',
    nav_episodes: 'Episodios',
    nav_about: 'Sobre mí',
    nav_contact: 'Contacto',
    nav_crm: 'Acceso CRM',
    hero_title: 'El Podcast #1 para Mujeres Ambiciosas',
    hero_subtitle: 'Escuchar el Podcast Iconic es como tomar un café con una mentora que no te dejará jugar en pequeño. Zuzana Husarova te enseña a ser tú misma e icónica.',
    hero_cta: 'Escuchar lo último',
    hero_kicker: 'The Iconic Podcast',
    hero_spotify_btn: 'Spotify',
    latest_episodes: 'Últimos Episodios',
    search_placeholder: 'Buscar episodio...',
    no_episodes_found: 'No se encontraron episodios.',
    filter_all: 'Todos',
    listen_on: 'Escúchalo en',
    episode_about_title: 'Sobre el episodio',
    episode_description_suffix: 'Escucha este episodio y descubre más sobre cómo ser icónica en tu negocio y vida personal. Zuzana comparte sus experiencias personales, altibajos.',
    listen_button: 'Escuchar',
    contact_title: 'Contáctanos',
    contact_subtitle: '¿Tienes una pregunta, interés en colaborar o comentarios? Escríbenos.',
    contact_info_title: 'Información de contacto',
    contact_email: 'Correo',
    contact_phone: 'Teléfono',
    contact_instagram: 'Instagram',
    contact_success_title: '¡Mensaje enviado!',
    contact_success_msg: 'Gracias por tu interés. Nos pondremos en contacto pronto.',
    form_name: 'Nombre',
    form_email: 'Correo',
    form_phone: 'Teléfono',
    form_message: 'Mensaje',
    form_submit: 'Enviar Mensaje',
    footer_desc: 'Un podcast para mujeres que quieren más. Negocios, mentalidad y estilo de vida sin compromisos.',
    footer_menu: 'Menú',
    footer_contact: 'Contacto',
    footer_location: 'Praga, República Checa',
    footer_rights: 'Todos los derechos reservados.',
    chatbot_welcome: '¡Hola! Soy la asistente IA de ICONIC. ¿Cómo puedo ayudarte a comenzar tu viaje?',
    chatbot_starters: ["Iniciar un negocio 🚀", "Busco inspiración ✨", "Trabajar con Zuzka 🤝", "Aumentar confianza 💖"],
    crm_title: 'Panel CRM ICONIC',
    crm_leads: 'Prospectos Capturados',
    placeholder_loading: 'Cargando...',
    newsletter_title: 'Únete al Club ICONIC',
    newsletter_desc: 'Recibe tu dosis semanal de inspiración e invitaciones VIP directamente en tu correo.',
    newsletter_placeholder: 'Tu correo',
    newsletter_btn: 'Únete Ahora',
    newsletter_success: '¡Bienvenida al club! 🥂',
    guest_modal_title: '¿Quieres ser vista?',
    guest_modal_desc: 'Sé una invitada en nuestro podcast y muestra al mundo tu visión y alcance empresarial.',
    guest_modal_btn: 'Quiero ser invitada',
    guest_modal_success: '¡Genial! Te contactaremos pronto.',
    menu_profile: 'Perfil',
    menu_sign_in: 'Iniciar sesión',
    menu_sign_out: 'Cerrar sesión',
    menu_language: 'Idioma'
  }
};

// Real links provided by the user
const LINKS = {
  spotify: 'https://open.spotify.com/show/5TNpvLzycWShFtP0uu39bE',
  youtube: 'https://www.youtube.com/@ZuzziHusarova',
  apple: 'https://podcasts.apple.com/cz/podcast/iconic-podcast-by-zuzzi-mentor/id1831207868?l=cs',
  amazon: 'https://www.amazon.com/ICONIC-Podcast-by-Zuzzi-Mentor/dp/B0FLDMHDQM'
};

export const PRICING_PLANS = [
  { name: 'Mentoring Start', price: '4.990 Kč', recommended: false },
  { name: 'Business Grow', price: '14.990 Kč', recommended: true },
  { name: 'Iconic Brand VIP', price: '39.990 Kč', recommended: false },
];

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: '11',
    title: 'EP 11: Jak vybudovat impérium na 0% chemie | Jiří Černota (BEWIT)',
    description: 'Může být majitel firmy tím nejdůležitějším "motorem", který nelze nahradit? Jiří Černota, vizionář a zakladatel BEWIT, opustil byznys ve stavebnictví, aby následoval svůj koníček a vytvořil jednu z největších evropských značek esenciálních olejů a superpotravin.',
    duration: '47 min',
    date: '2024-11-04',
    imageUrl: '/ep11.jpg',
    videoUrl: 'q56HTl3R1n4',
    tags: ['Business', 'Lifestyle'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/2OVxA0qrR5iWgbbwK1Y9uP', 
      youtube: 'https://youtu.be/q56HTl3R1n4', 
      apple: LINKS.apple 
    }
  },
  {
    id: '15',
    title: 'EP 15: O tomhle přístupu k rodičovství potřebuješ slyšet | Tereza Veselá',
    description: 'Jak zvládat emoce a nezbláznit se? Tereza Veselá z Matcastu sdílí, proč je mateřství největší školou seberozvoje a proč dítě nepotřebuje animátora, ale tvou pravdivou přítomnost.',
    duration: '32 min',
    date: '2024-12-03',
    imageUrl: '/ep15.jpg',
    videoUrl: 'sCIGYzgfXNA',
    tags: ['Lifestyle', 'Mindset'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/5yqjO88j3vITLxv6xOTY1P', 
      youtube: 'https://www.youtube.com/watch?v=sCIGYzgfXNA', 
      apple: LINKS.apple 
    }
  },
  {
    id: '14',
    title: 'EP 14: Longevity a síla mysli | Josef Joska Šálek',
    description: 'Jak prodloužit aktivní život o 20-30 let? Josef Joska Šálek, držitel 3 Guinnessových rekordů, sdílí jak naše přesvědčení ovlivňují biologii a jak zvládnout chlad i strach ze stárnutí.',
    duration: '45 min',
    date: '2024-11-26',
    imageUrl: '/ep14.jpg',
    videoUrl: 'aabzcOd88H8',
    tags: ['Mindset', 'Lifestyle'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/0WH1kqEUv4dM5SQbr9d6T7', 
      youtube: 'https://www.youtube.com/watch?v=aabzcOd88H8', 
      apple: LINKS.apple 
    }
  },
  {
    id: '13',
    title: 'EP 13: Máš na míň a je to OK | Nikola Zbytovská',
    description: 'Herečka a spisovatelka Nikola Zbytovská o strachu z vystupování, toxických vztazích v rodině a odvaze říct si "Mám na míň". Proč klíčem k lehkosti není víc dřít.',
    duration: '93 min',
    date: '2024-11-18',
    imageUrl: '/ep13.jpg',
    videoUrl: 'GfSEf8PSbno',
    tags: ['Mindset', 'Lifestyle'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/6YlNTa7lIVxBzR4rOA21iW', 
      youtube: 'https://www.youtube.com/watch?v=GfSEf8PSbno', 
      apple: LINKS.apple 
    }
  },
  {
    id: '12',
    title: 'EP 12: Na plnění snů není nikdy pozdě | Tomáš Adam',
    description: 'Rapper a režisér Tomáš Adam o tom, jak překonat strach z nedokonalosti a jít si za svým snem. Jak vznikaly filmy Sebepoznání a Všechno je možný, které oslovily statisíce diváků.',
    duration: '38 min',
    date: '2024-11-11',
    imageUrl: '/ep12.jpg',
    videoUrl: 'uuLGEwd7n9s',
    tags: ['Mindset', 'Lifestyle'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/1Wz4l0bzunXKRFIheyOQtg', 
      youtube: 'https://www.youtube.com/watch?v=uuLGEwd7n9s', 
      apple: LINKS.apple 
    }
  },
  {
    id: '10',
    title: 'EP 10: Jak najít vlastní hlas mezi tlaky showbyznysu | Barbora Seidlová',
    description: 'Jak najít vlastní hlas mezi tlaky showbyznysu a naučit se být sama sebou, když prožíváš hereckou slávu už od patnácti? Herečka Bára Seidlová otevřeně mluví o své cestě od dětského filmu přes seriálové role až po dospělost plnou hledání skutečné spokojenosti i mimo obrazovku.',
    duration: '45 min',
    date: '2024-10-28',
    imageUrl: '/ep10.jpg',
    videoUrl: 'N-NK0fPKzE8',
    tags: ['Mindset', 'Lifestyle'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/5WIfKsKQMyhkKnL03LhOfP', 
      youtube: 'https://youtu.be/N-NK0fPKzE8', 
      apple: LINKS.apple 
    }
  },
  {
    id: '9',
    title: 'EP 09: Z vězení ke světovým rekordům | Josef Joska Šálek',
    description: 'Jak se může stát, že tě při přestupu na letišti odvedou ozbrojenci a skončíš ve vězení? Josef Joska Šálek dokázal traumatizující zkušenost v arabské zemi proměnit v příležitost a připravil si půdu pro zdolávání světových rekordů.',
    duration: '45 min',
    date: '2024-10-21',
    imageUrl: '/ep09.jpg',
    videoUrl: 'vAphua6yLak',
    tags: ['Mindset', 'Lifestyle'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/17phsYbBmJSXgZ7uaf83ZU', 
      youtube: 'https://youtu.be/vAphua6yLak', 
      apple: LINKS.apple 
    }
  },
  {
    id: '8',
    title: 'EP 08: Vědomé sociální sítě a budoucnost digitálu | Ladislav Kocián',
    description: 'Jak fungují algoritmy sociálních sítí a proč nás nutí scrollovat dál? Ladislav Kocián, CEO a zakladatel sociální sítě Mait.me, sdílí svou vizi etičtějších a vědomějších sítí, kde má člověk opět kontrolu nad svým obsahem i časem.',
    duration: '42 min',
    date: '2024-10-14',
    imageUrl: '/ep08.jpg',
    videoUrl: '6D8j2PTK9Ls',
    tags: ['Business', 'Lifestyle'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/3Xi2n6fqtM0sos6mmOBCsR', 
      youtube: 'https://youtu.be/6D8j2PTK9Ls', 
      apple: LINKS.apple 
    }
  },
  {
    id: '7',
    title: 'EP 07: Od závislostí ke světovým rekordům | Josef Joska Šálek',
    description: 'Nikdy nesportoval, měl špatnou životosprávu a propadl závislostem. Dnes má tři světové rekordy a učí lidi, jak nastavit vlastní mysl na úspěch. Rekordman Josef Joska Šálek sdílí, jak překonal výkony Wima Hofa a jak se rodily Guinessovy rekordy v planku.',
    duration: '48 min',
    date: '2024-10-07',
    imageUrl: '/ep07.jpg',
    videoUrl: '6mq80ttk-80',
    tags: ['Mindset', 'Lifestyle'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/5a5ntm9JTwXQAVJrhrIDVw', 
      youtube: 'https://youtu.be/6mq80ttk-80', 
      apple: LINKS.apple 
    }
  },
  {
    id: '6',
    title: 'EP 06: Supravodivost a svoboda od ega | Vendy Šmídke Kociánová',
    description: 'Co se stane, když přestaneš slepě hledat techniky a návody? Vendy Šmídke Kociánová otevírá téma supravodivosti – stavu, kdy přestává fungovat snaha mít vše pod kontrolou a kdy se učíme pustit mysl, ego a iluzi tvůrce.',
    duration: '52 min',
    date: '2024-09-30',
    imageUrl: '/ep06.jpg',
    videoUrl: 'JnXjnL1VmGE',
    tags: ['Mindset', 'Lifestyle'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/4e0WuapGgjT6dXAFLnEODO', 
      youtube: 'https://youtu.be/JnXjnL1VmGE', 
      apple: LINKS.apple 
    }
  },
  {
    id: '5',
    title: 'EP 05: Archetypy a ženská energie | Veronika Slavíková',
    description: 'Jak archetypy ovlivňují naše vztahy, práci i podnikání? Terapeutka Veronika Slavíková ukazuje, jak skrze archetypy a ženskou energii můžeme lépe porozumět sami sobě. Proč je Marilyn Monroe fascinujícím příkladem ženské síly i zranitelnosti.',
    duration: '50 min',
    date: '2024-09-23',
    imageUrl: '/ep05.jpg',
    videoUrl: 'erztWsFfKr4',
    tags: ['Mindset', 'Lifestyle'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/14lUpGZJ0NkMEUmPbExJSt', 
      youtube: 'https://youtu.be/erztWsFfKr4', 
      apple: LINKS.apple 
    }
  },
  {
    id: '4',
    title: 'EP 04: Jak vybudovat firmu, která funguje bez tebe | Tomáš Suchomel',
    description: 'Tomáš Suchomel, výkonný ředitel Garantovanynajem.cz, sdílí svoji podnikatelskou cestu – od začátků, přes období krize až po budování stabilního týmu a firmy, která funguje i bez jeho každodenní přítomnosti.',
    duration: '55 min',
    date: '2024-09-16',
    imageUrl: '/ep04.jpg',
    videoUrl: 'cJvSbLb1288',
    tags: ['Business', 'Finance'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/21u0O5RUkKdREN7KI58KVS', 
      youtube: 'https://youtu.be/cJvSbLb1288', 
      apple: LINKS.apple 
    }
  },
  {
    id: '3',
    title: 'EP 03: Z toxického vztahu ke kreativní svobodě | Lenka Kellnerová',
    description: 'Lenka Kellnerová sdílí svůj příběh lásky s cizinci, z nichž jeden se proměnil v násilný vztah, i to, jak se z něj dokázala vymanit. Jak ji Canva a kreativní práce pomohla vrátit radost i sebehodnotu?',
    duration: '48 min',
    date: '2024-09-09',
    imageUrl: '/ep03.jpg',
    videoUrl: 'jxtFGL8DzWY',
    tags: ['Lifestyle', 'Mindset'],
    platformLinks: { 
      spotify: 'https://open.spotify.com/episode/4baBHSUX7F8wszhHpduM2h', 
      youtube: 'https://youtu.be/jxtFGL8DzWY', 
      apple: LINKS.apple 
    }
  }
];
