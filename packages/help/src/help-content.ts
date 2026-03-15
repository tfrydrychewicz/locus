import type { HelpTopicId } from './help-registry.js'

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

export function getHelpContent(topicId: HelpTopicId, locale: string): HelpArticle | null {
  const localeContent = content[locale] ?? content.en
  return localeContent?.[topicId] ?? content.en?.[topicId] ?? null
}

export function registerHelpContent(locale: string, topicId: string, article: HelpArticle): void {
  if (!content[locale]) {
    content[locale] = {}
  }
  content[locale][topicId] = article
}
