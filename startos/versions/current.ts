import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.30.0:0',
  releaseNotes: {
    en_US: `Updates Memos to 0.30.0.

- Adds the Web Clipper, rebuilt Markdown editor, richer memo details, flexible feeds, and an OpenAPI-driven MCP integration.
- Existing instance-level tag settings are copied to each user during the upstream database migration.
- Instances without \`MEMOS_INSTANCE_URL\` are private; RSS and public anonymous access require a pinned or automatically derived instance URL.
- Persistent SQLite data and uploaded assets remain on the \`main\` volume at \`/var/opt/memos\`; no package migration is required.

[Full upstream release notes](https://github.com/usememos/memos/releases/tag/v0.30.0)`,
    es_ES: `Versión inicial de Memos para StartOS.

Ejecuta la imagen oficial \`neosmemo/memos:0.30.0\` como un único daemon con una base de datos SQLite integrada. Los datos persistentes (la base de datos SQLite y los recursos subidos) viven en el volumen \`main\` en \`/var/opt/memos\`.

- Una interfaz web (puerto interno 5230).
- \`MEMOS_INSTANCE_URL\` se deriva automáticamente de la dirección actual de la interfaz web; una acción opcional "Definir URL de Instancia" permite a los usuarios de RSS/webhooks fijarla a un dominio externo.
- La primera cuenta creada vía la interfaz web se convierte en HOST (admin); cierra el registro público después en los Ajustes de Memos.
- Las copias de seguridad son una instantánea de volumen completo de \`main\`.

[Notas de la release upstream](https://github.com/usememos/memos/releases/tag/v0.30.0)`,
    de_DE: `Erstes Release von Memos für StartOS.

Führt das offizielle \`neosmemo/memos:0.30.0\`-Image als einzelnen Daemon mit eingebetteter SQLite-Datenbank aus. Persistente Daten (die SQLite-DB und hochgeladene Assets) liegen auf dem \`main\`-Volume unter \`/var/opt/memos\`.

- Eine Web-Oberfläche (interner Port 5230).
- \`MEMOS_INSTANCE_URL\` wird automatisch aus der aktuellen Adresse der Web-Oberfläche abgeleitet; eine optionale „Instanz-URL festlegen"-Aktion erlaubt RSS/Webhook-Nutzern, sie auf eine externe Domain zu fixieren.
- Das erste über die Web-Oberfläche erstellte Konto wird HOST (Admin); schließe danach die öffentliche Registrierung in den Memos-Einstellungen.
- Backups sind ein komplettes Volume-Snapshot von \`main\`.

[Vollständige Upstream-Release-Notes](https://github.com/usememos/memos/releases/tag/v0.30.0)`,
    pl_PL: `Pierwsze wydanie Memos dla StartOS.

Uruchamia oficjalny obraz \`neosmemo/memos:0.30.0\` jako pojedynczy daemon z wbudowaną bazą danych SQLite. Persistentne dane (baza danych SQLite i przesłane zasoby) znajdują się na wolumenie \`main\` w \`/var/opt/memos\`.

- Jeden interfejs WWW (wewnętrzny port 5230).
- \`MEMOS_INSTANCE_URL\` jest wyliczany automatycznie z bieżącego adresu interfejsu WWW; opcjonalna akcja „Ustaw URL instancji" pozwala użytkownikom RSS/webhooków ustawić go na swoją domenę zewnętrzną.
- Pierwsze konto utworzone przez interfejs WWW staje się HOST-em (adminem); zamknij publiczną rejestrację w Ustawieniach Memos.
- Kopie zapasowe to pełny snapshot wolumenu \`main\`.

[Pełne notatki wydania upstream](https://github.com/usememos/memos/releases/tag/v0.30.0)`,
    fr_FR: `Première version de Memos pour StartOS.

Exécute l'image officielle \`neosmemo/memos:0.30.0\` comme un seul daemon avec une base de données SQLite intégrée. Les données persistantes (la base SQLite et les ressources téléversées) se trouvent sur le volume \`main\` dans \`/var/opt/memos\`.

- Une interface web (port interne 5230).
- \`MEMOS_INSTANCE_URL\` est dérivé automatiquement de l'adresse actuelle de l'interface web ; une action optionnelle « Définir l'URL d'instance » permet aux utilisateurs RSS/webhooks de la fixer à un domaine externe.
- Le premier compte créé via l'interface web devient HOST (admin) ; fermez ensuite l'inscription publique dans les Réglages de Memos.
- Les sauvegardes sont un instantané complet du volume \`main\`.

[Notes de version amont complètes](https://github.com/usememos/memos/releases/tag/v0.30.0)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
