import { getHelpTopic, type HelpTopicId } from './help-registry.js'

export interface HelpArticle {
  title: string
  quickAnswer: string
  sections: HelpSection[]
  adhdTip?: string
}

export interface HelpSection {
  heading: string
  content: string
}

type HelpContentMap = Record<string, Record<string, HelpArticle>>

const content: HelpContentMap = {
  en: {
    'settings/overview': {
      title: 'Settings Overview',
      quickAnswer:
        'Settings let you personalise Locus: choose your theme, switch language, configure the editor, and control AI features — all stored locally on your device.',
      sections: [
        {
          heading: 'Appearance',
          content:
            'Choose between Light, Dark, or System theme. System automatically follows your OS dark-mode preference. You can also switch the app language between English and Polish — the change takes effect immediately without restarting.',
        },
        {
          heading: 'Editor',
          content:
            'Configure auto-save interval (default 500 ms), spell-check, and default note format. These settings apply to every note you create or edit.',
        },
        {
          heading: 'AI & Models',
          content:
            'Locus is privacy-first: AI features are opt-in and require you to supply your own API key or download a local model. No data leaves your device without your explicit consent.',
        },
        {
          heading: 'Data & Privacy',
          content:
            'All your notes, tasks, and cognitive data are stored locally in a SQLite database on your machine. You can export your data at any time from Settings → Data & Storage.',
        },
      ],
      adhdTip:
        "Don't try to configure everything at once. Start with the theme that feels comfortable and the language you prefer — everything else has sensible defaults.",
    },
    'notes/editor': {
      title: 'Note Editor',
      quickAnswer:
        'The note editor is a rich-text workspace for capturing ideas, meeting notes, decisions, and anything else. Just start typing — your work is saved automatically every 500 ms.',
      sections: [
        {
          heading: 'Formatting toolbar',
          content:
            'Use the toolbar at the top of the editor to format text. Headings (H1–H3), bold, italic, strikethrough, and inline code are all one click away. The Lists dropdown lets you create bullet, numbered, or task lists. The Blocks dropdown adds quotes, code blocks, and colour-coded callouts (Info, Warning, Success, Danger).',
        },
        {
          heading: 'Auto-save',
          content:
            'Locus saves your note 500 ms after you stop typing. You never need to press Save. A note is never lost mid-session — even if you switch to a different note or close the pane.',
        },
        {
          heading: 'Split panes',
          content:
            'Shift-click any note in the list to open it alongside your current note in a split pane. You can have as many panes as you need. Cmd-click opens a note in a completely new tab.',
        },
        {
          heading: 'Keyboard shortcuts',
          content:
            'Cmd+N creates a new note. Cmd+F focuses the search bar. Standard text shortcuts work inside the editor: Cmd+B for bold, Cmd+I for italic, Cmd+Z / Cmd+Shift+Z for undo / redo.',
        },
      ],
      adhdTip:
        "Don't wait until you have something polished to write. Start with a bullet point or a single sentence — Locus is designed for messy first drafts. You can always reorganise later.",
    },
    'notes/mentions': {
      title: '@Mentions & Note Links',
      quickAnswer:
        'Type @ to mention an entity (person, project, tag) or [[ to link another note. A dropdown appears as you type — pick an item to replace your text with a chip.',
      sections: [
        {
          heading: '@Entity mentions',
          content:
            'Type @ anywhere in a note to open the entity picker. Start typing to search by name — results filter as you type. Use the arrow keys to move, Enter to select, or click an item. The typed text (e.g. @foo) is replaced by a chip showing the entity label. Click a chip to open the entity popup.',
        },
        {
          heading: '[[Note links]]',
          content:
            'Type [[ to link another note. The same picker appears: search by note title, then select. The link appears as a chip. Archived notes are shown with dimmed styling. Click a chip to open the note popup.',
        },
        {
          heading: 'Zero categorization',
          content:
            'You do not need to choose a category before mentioning. Just type @ or [[ and pick from the list. Locus creates the link automatically — no extra steps.',
        },
      ],
      adhdTip:
        'Do not worry about linking everything perfectly. Mention people and projects as they come up while you write. The connections build themselves.',
    },
    'notes/search': {
      title: 'Searching Notes',
      quickAnswer:
        'Type in the search bar above the note list for instant full-text search. Press Cmd+K to open the command palette for a global search across notes and commands.',
      sections: [
        {
          heading: 'Full-text search',
          content:
            'The search bar uses SQLite FTS5 to search across note titles and body text. Results appear as you type (debounced to 300 ms). Matching notes are ranked by relevance.',
        },
        {
          heading: 'Command palette (Cmd+K)',
          content:
            'Press Cmd+K from anywhere in the app to open the command palette. It searches both commands and notes simultaneously. Use the arrow keys to navigate results and Enter to open.',
        },
        {
          heading: 'Tips for better results',
          content:
            'Search is case-insensitive and matches partial words. If you cannot find something, try a shorter keyword. FTS5 does not support fuzzy matching — spelling must be correct.',
        },
      ],
      adhdTip:
        'If you cannot remember where you put something, just type any word you associate with it. Locus searches the full body of every note, not just the title.',
    },
    'getting-started': {
      title: 'Getting Started with Locus',
      quickAnswer:
        'Locus is your ADHD-friendly knowledge management and productivity system. Capture notes, manage tasks, and let AI help you stay on track.',
      sections: [
        {
          heading: 'Quick capture',
          content:
            'Press Ctrl+N (or Cmd+N on Mac) to create a new note instantly. Type freely — organization comes later. Use slash commands (/) to add structure, or @ to mention entities like people, projects, or tags.',
        },
        {
          heading: 'Task management',
          content:
            'Tasks in Locus follow the Getting Things Done (GTD) methodology with PINCH scoring to help you prioritize based on what your ADHD brain actually responds to: Personal importance, Interest, Novelty, Challenge, and Hurry.',
        },
        {
          heading: 'Energy tracking',
          content:
            'Locus monitors your cognitive energy levels throughout the day and suggests tasks that match your current capacity. High energy? Tackle that complex report. Low energy? Review and organize.',
        },
        {
          heading: 'AI assistant',
          content:
            'Your AI assistant can help with daily briefs, task breakdowns, writing tone checks, and more. Configure your preferred AI provider in Settings > AI & Models.',
        },
      ],
      adhdTip:
        "Don't try to set up everything at once. Start with note capture — just write. The system will learn your patterns and suggest improvements over time.",
    },
  },
  pl: {
    'settings/overview': {
      title: 'Przegląd ustawień',
      quickAnswer:
        'Ustawienia pozwalają spersonalizować Locus: wybrać motyw, zmienić język, skonfigurować edytor oraz kontrolować funkcje AI — wszystko przechowywane lokalnie na Twoim urządzeniu.',
      sections: [
        {
          heading: 'Wygląd',
          content:
            'Wybierz między motywem Jasnym, Ciemnym lub Systemowym. Motyw Systemowy automatycznie podąża za trybem ciemnym systemu operacyjnego. Możesz też przełączyć język aplikacji między angielskim a polskim — zmiana następuje natychmiast bez restartu.',
        },
        {
          heading: 'Edytor',
          content:
            'Skonfiguruj interwał automatycznego zapisu (domyślnie 500 ms), sprawdzanie pisowni i domyślny format notatki. Ustawienia te dotyczą każdej notatki, którą tworzysz lub edytujesz.',
        },
        {
          heading: 'AI i modele',
          content:
            'Locus stawia prywatność na pierwszym miejscu: funkcje AI są opcjonalne i wymagają podania własnego klucza API lub pobrania lokalnego modelu. Żadne dane nie opuszczają Twojego urządzenia bez Twojej wyraźnej zgody.',
        },
        {
          heading: 'Dane i prywatność',
          content:
            'Wszystkie Twoje notatki, zadania i dane poznawcze są przechowywane lokalnie w bazie danych SQLite na Twoim komputerze. W dowolnym momencie możesz wyeksportować dane z Ustawienia → Dane i pamięć.',
        },
      ],
      adhdTip:
        'Nie próbuj konfigurować wszystkiego naraz. Zacznij od motywu, który jest dla Ciebie wygodny, i preferowanego języka — reszta ma sensowne wartości domyślne.',
    },
    'notes/editor': {
      title: 'Edytor notatek',
      quickAnswer:
        'Edytor notatek to obszar roboczy z bogatym tekstem do zapisywania pomysłów, notatek ze spotkań, decyzji i wszystkiego innego. Po prostu zacznij pisać — Twoja praca jest zapisywana automatycznie co 500 ms.',
      sections: [
        {
          heading: 'Pasek narzędzi formatowania',
          content:
            'Użyj paska narzędzi na górze edytora, aby formatować tekst. Nagłówki (H1–H3), pogrubienie, kursywa, przekreślenie i kod inline są dostępne jednym kliknięciem. Lista rozwijana Listy umożliwia tworzenie list punktowanych, numerowanych lub zadań. Lista rozwijana Bloki dodaje cytaty, bloki kodu i kolorowe wywołania (Informacja, Ostrzeżenie, Sukces, Niebezpieczeństwo).',
        },
        {
          heading: 'Automatyczny zapis',
          content:
            'Locus zapisuje notatkę 500 ms po zatrzymaniu pisania. Nigdy nie musisz naciskać Zapisz. Notatka nigdy nie jest gubiona w trakcie sesji — nawet jeśli przełączysz się na inną notatkę lub zamkniesz panel.',
        },
        {
          heading: 'Podzielone panele',
          content:
            'Shift-kliknij dowolną notatkę na liście, aby otworzyć ją obok bieżącej notatki w podzielonym panelu. Możesz mieć tyle paneli, ile potrzebujesz. Cmd-kliknięcie otwiera notatkę w zupełnie nowej karcie.',
        },
        {
          heading: 'Skróty klawiszowe',
          content:
            'Cmd+N tworzy nową notatkę. Cmd+F koncentruje pasek wyszukiwania. Standardowe skróty tekstowe działają w edytorze: Cmd+B pogrubienie, Cmd+I kursywa, Cmd+Z / Cmd+Shift+Z cofnij / ponów.',
        },
      ],
      adhdTip:
        'Nie czekaj, aż będziesz mieć coś dopracowanego do napisania. Zacznij od punktu lub jednego zdania — Locus jest zaprojektowany dla nieuporządkowanych pierwszych szkiców. Zawsze możesz się zreorganizować później.',
    },
    'notes/mentions': {
      title: '@Wzmianki i linki do notatek',
      quickAnswer:
        'Wpisz @, aby wspomnieć encję (osobę, projekt, tag) lub [[, aby połączyć inną notatkę. Podczas pisania pojawi się lista — wybierz element, aby zastąpić tekst chipem.',
      sections: [
        {
          heading: '@Wzmianki encji',
          content:
            'Wpisz @ w dowolnym miejscu notatki, aby otworzyć wybór encji. Zacznij pisać, aby wyszukać po nazwie — wyniki filtrują się podczas pisania. Użyj strzałek do nawigacji, Enter do wyboru lub kliknij element. Wpisany tekst (np. @foo) zostanie zastąpiony chipem z etykietą encji. Kliknij chip, aby otworzyć popup encji.',
        },
        {
          heading: '[[Linki do notatek]]',
          content:
            'Wpisz [[, aby połączyć inną notatkę. Pojawi się ta sama lista: wyszukaj po tytule, następnie wybierz. Link pojawia się jako chip. Zarchiwizowane notatki są wyświetlane przyciemnione. Kliknij chip, aby otworzyć popup notatki.',
        },
        {
          heading: 'Bez kategoryzacji',
          content:
            'Nie musisz wybierać kategorii przed wspomnieniem. Wystarczy wpisać @ lub [[ i wybrać z listy. Locus tworzy powiązanie automatycznie — bez dodatkowych kroków.',
        },
      ],
      adhdTip:
        'Nie martw się o idealne linkowanie. Wspominaj ludzi i projekty w miarę pisania. Połączenia budują się same.',
    },
    'notes/search': {
      title: 'Wyszukiwanie notatek',
      quickAnswer:
        'Wpisz w pasku wyszukiwania nad listą notatek, aby natychmiast przeszukać pełny tekst. Naciśnij Cmd+K, aby otworzyć paletę poleceń do globalnego wyszukiwania notatek i poleceń.',
      sections: [
        {
          heading: 'Wyszukiwanie pełnotekstowe',
          content:
            'Pasek wyszukiwania używa SQLite FTS5 do przeszukiwania tytułów i treści notatek. Wyniki pojawiają się podczas pisania (z opóźnieniem 300 ms). Pasujące notatki są klasyfikowane według trafności.',
        },
        {
          heading: 'Paleta poleceń (Cmd+K)',
          content:
            'Naciśnij Cmd+K z dowolnego miejsca w aplikacji, aby otworzyć paletę poleceń. Wyszukuje jednocześnie polecenia i notatki. Użyj klawiszy strzałek do nawigacji po wynikach i Enter, aby otworzyć.',
        },
        {
          heading: 'Wskazówki dla lepszych wyników',
          content:
            'Wyszukiwanie jest niewrażliwe na wielkość liter i dopasowuje częściowe słowa. Jeśli nie możesz czegoś znaleźć, spróbuj krótszego słowa kluczowego. FTS5 nie obsługuje rozmytego dopasowania — pisownia musi być poprawna.',
        },
      ],
      adhdTip:
        'Jeśli nie pamiętasz, gdzie coś umieściłeś, wpisz dowolne słowo, które kojarzysz z tym. Locus przeszukuje pełną treść każdej notatki, nie tylko tytuł.',
    },
    'getting-started': {
      title: 'Pierwsze kroki z Locus',
      quickAnswer:
        'Locus to Twój system zarządzania wiedzą i produktywnością przyjazny dla ADHD. Zapisuj notatki, zarządzaj zadaniami i pozwól AI pomagać Ci w utrzymaniu koncentracji.',
      sections: [
        {
          heading: 'Szybkie przechwytywanie',
          content:
            'Naciśnij Ctrl+N (lub Cmd+N na Macu), aby natychmiast utworzyć nową notatkę. Pisz swobodnie — organizacja przyjdzie później. Użyj poleceń ukośnika (/), aby dodać strukturę, lub @ aby wspomnieć encje takie jak osoby, projekty czy tagi.',
        },
        {
          heading: 'Zarządzanie zadaniami',
          content:
            'Zadania w Locus opierają się na metodologii Getting Things Done (GTD) z punktacją PINCH, która pomaga ustalać priorytety na podstawie tego, na co Twój mózg z ADHD faktycznie reaguje: Osobiste znaczenie, Zainteresowanie, Nowość, Wyzwanie i Pilność.',
        },
        {
          heading: 'Śledzenie energii',
          content:
            'Locus monitoruje Twój poziom energii poznawczej w ciągu dnia i sugeruje zadania dopasowane do Twojej aktualnej wydolności. Wysoka energia? Weź się za ten złożony raport. Niska energia? Przejrzyj i uporządkuj.',
        },
        {
          heading: 'Asystent AI',
          content:
            'Twój asystent AI może pomóc z dziennymi przeglądami, rozbiciem zadań, sprawdzaniem tonu pisania i nie tylko. Skonfiguruj preferowanego dostawcę AI w Ustawienia > AI i modele.',
        },
      ],
      adhdTip:
        'Nie próbuj ustawiać wszystkiego naraz. Zacznij od zapisywania notatek — po prostu pisz. System nauczy się Twoich wzorców i z czasem zasugeruje ulepszenia.',
    },
  },
}

const entityContent: HelpContentMap = {
  en: {
    'entities/overview': {
      title: 'Entities & Knowledge Base',
      quickAnswer:
        'Entities are structured, persistent records — people, projects, decisions, and more — that link to your notes and each other, building a context web for your ADHD brain.',
      sections: [
        {
          heading: 'What are entities?',
          content:
            'Entities are pieces of knowledge with a defined structure. Each belongs to a type (e.g. Person, Project) and has a set of fields tailored to that type. Unlike notes — free-form and unstructured — entities have predictable attributes that make filtering, searching, and summarising easy.',
        },
        {
          heading: 'How to use entities',
          content:
            'Type @ in a note to mention an entity — the link is created automatically. On the Entities page, browse by type, search, and edit field values. Computed fields automatically collect related entities using LQL queries.',
        },
        {
          heading: 'Entity types and fields',
          content:
            'Built-in types (Person, Project, Team, Decision, OKR) are ready to use. You can also create custom types with any fields you need — text, number, date, select lists, and even computed fields that gather entities matching an LQL query.',
        },
      ],
      adhdTip:
        'Instead of trying to categorise everything upfront — start by tagging people and projects with @mentions while you write. Structure will emerge naturally.',
    },
    'entities/types': {
      title: 'Entity Types',
      quickAnswer:
        'Entity types define the structure and fields for a category of knowledge. Built-in types cover most needs; create custom types for specialised requirements.',
      sections: [
        {
          heading: 'Built-in types',
          content:
            'Locus ships with five built-in types: Person, Project, Team, Decision, and OKR. They come with sensible fields and cannot be deleted, but you can extend the system with custom types.',
        },
        {
          heading: 'Creating a custom type',
          content:
            'Open the Entities page and use the manage types button. Give the type a name, an emoji icon, and a colour, then add fields: text, number, date, select, relation, or computed (LQL).',
        },
        {
          heading: 'Computed fields (LQL)',
          content:
            'Computed fields dynamically gather entities matching an LQL query. For example, a "Members" field on a Project type might use entity_type = \'person\' and team = {this}, automatically listing all assigned people. {this} refers to the current entity.',
        },
      ],
      adhdTip:
        "Don't create too many fields at once — start with 2-3 most important ones. Adding fields is easy at any time, and fewer required fields = less friction when creating entities.",
    },
  },
  pl: {
    'entities/overview': {
      title: 'Encje i baza wiedzy',
      quickAnswer:
        'Encje to trwałe rekordy wiedzy – osoby, projekty, decyzje i inne – które można łączyć z notatkami i ze sobą nawzajem, budując siatkę kontekstu dla mózgu z ADHD.',
      sections: [
        {
          heading: 'Czym są encje?',
          content:
            'Encje to elementy wiedzy z określoną strukturą: każda należy do typu (np. Osoba, Projekt) i ma zestaw pól dopasowany do danego typu. W odróżnieniu od notatek – swobodnych i nieustrukturyzowanych – encje mają przewidywalne atrybuty, co ułatwia filtrowanie, wyszukiwanie i tworzenie zestawień.',
        },
        {
          heading: 'Jak korzystać z encji',
          content:
            'Wpisz @ w notatce, aby wspomnieć encję – powiązanie jest tworzone automatycznie. Na stronie Encje przeglądaj je według typu, wyszukuj i edytuj pola. Pola obliczeniowe automatycznie zbierają powiązane encje za pomocą zapytań LQL.',
        },
        {
          heading: 'Typy encji i pola',
          content:
            'Wbudowane typy (Osoba, Projekt, Zespół, Decyzja, OKR) można od razu używać. Możesz też tworzyć własne typy z dowolnymi polami – tekstowymi, liczbowymi, datami, listami wyboru, a nawet polami obliczeniowymi zbierającymi encje spełniające zapytanie LQL.',
        },
      ],
      adhdTip:
        'Zamiast próbować wszystko skategoryzować od razu – zacznij od oznaczania ludzi i projektów przez @wzmianki podczas pisania. Struktura wyłoni się naturalnie.',
    },
    'entities/types': {
      title: 'Typy encji',
      quickAnswer:
        'Typy encji definiują strukturę i pola dla kategorii wiedzy. Wbudowane typy zaspokajają większość potrzeb; możesz tworzyć własne dla specyficznych wymagań.',
      sections: [
        {
          heading: 'Wbudowane typy',
          content:
            'Locus zawiera pięć wbudowanych typów: Osoba, Projekt, Zespół, Decyzja i OKR. Mają one odpowiednie pola i nie można ich usunąć, ale można rozszerzać o niestandardowe typy.',
        },
        {
          heading: 'Tworzenie własnego typu',
          content:
            'Otwórz stronę Encje i użyj przycisku zarządzania typami. Nadaj typowi nazwę, emoji-ikonę i kolor, a następnie dodaj pola: tekstowe, liczbowe, daty, listy wyboru, relacje lub pola obliczeniowe (LQL).',
        },
        {
          heading: 'Pola obliczeniowe (LQL)',
          content:
            'Pola obliczeniowe dynamicznie zbierają encje pasujące do zapytania LQL. Na przykład pole "Członkowie" w Projekcie może mieć zapytanie entity_type = \'person\' and team = {this}, co automatycznie wyświetla wszystkich przypisanych. {this} odnosi się do aktualnej encji.',
        },
      ],
      adhdTip:
        'Nie twórz zbyt wielu pól od razu – zacznij od 2-3 najważniejszych. Dodawanie pól jest łatwe w każdej chwili, a mniej pól do wypełnienia = mniejsze opory przed tworzeniem encji.',
    },
  },
}

// Merge entity content into the main content map
for (const locale of Object.keys(entityContent)) {
  if (!content[locale]) content[locale] = {}
  Object.assign(content[locale], entityContent[locale])
}

export function getHelpContent(topicId: HelpTopicId, locale: string): HelpArticle | null {
  // Content is keyed by the topic's file path (e.g. 'notes/editor'), not the topic ID
  const file = getHelpTopic(topicId).file
  const localeContent = content[locale] ?? content.en
  return localeContent?.[file] ?? content.en?.[file] ?? null
}

export function registerHelpContent(locale: string, topicId: string, article: HelpArticle): void {
  if (!content[locale]) {
    content[locale] = {}
  }
  // Resolve known topic IDs to their file path so the key is consistent with getHelpContent
  let key = topicId
  try {
    key = getHelpTopic(topicId as HelpTopicId).file
  } catch {
    // topicId is not a registered topic — store as-is (custom content)
  }
  content[locale][key] = article
}
