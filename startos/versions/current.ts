import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.31.0:1',
  releaseNotes: {
    en_US: `- Reset Admin Password's confirmation states that it signs out the administrator's sessions
- Until an instance URL is chosen, Memos uses your public domain if you have one, otherwise the .local address
- Open UI opens the instance URL when your connection can reach it
- The Set Instance URL task clears once a URL is chosen, and returns if that address is removed`,
    es_ES: `- La confirmación de Restablecer contraseña de administrador indica que cierra las sesiones del administrador
- Mientras no se elija una URL de instancia, Memos usa tu dominio público si tienes uno y, si no, la dirección .local
- Abrir interfaz abre la URL de instancia cuando tu conexión puede alcanzarla
- La tarea Definir URL de Instancia desaparece al elegir una URL y vuelve si esa dirección se elimina`,
    de_DE: `- Die Bestätigung von Administrator-Passwort zurücksetzen weist darauf hin, dass die Sitzungen des Administrators abgemeldet werden
- Solange keine Instanz-URL gewählt ist, verwendet Memos deine öffentliche Domain, falls vorhanden, sonst die .local-Adresse
- Oberfläche öffnen öffnet die Instanz-URL, wenn deine Verbindung sie erreichen kann
- Die Aufgabe Instanz-URL festlegen verschwindet, sobald eine URL gewählt ist, und kehrt zurück, wenn diese Adresse entfernt wird`,
    pl_PL: `- Potwierdzenie akcji Zresetuj hasło administratora informuje, że sesje administratora zostaną wylogowane
- Dopóki nie wybierzesz URL instancji, Memos używa Twojej domeny publicznej, jeśli ją masz, a w przeciwnym razie adresu .local
- Otwórz interfejs otwiera URL instancji, gdy Twoje połączenie może go osiągnąć
- Zadanie Ustaw URL instancji znika po wybraniu adresu i wraca, jeśli ten adres zostanie usunięty`,
    fr_FR: `- La confirmation de Réinitialiser le mot de passe administrateur indique que les sessions de l'administrateur seront déconnectées
- Tant qu'aucune URL d'instance n'est choisie, Memos utilise votre domaine public si vous en avez un, sinon l'adresse .local
- Ouvrir l'interface ouvre l'URL d'instance lorsque votre connexion peut l'atteindre
- La tâche Définir l'URL d'instance disparaît une fois une URL choisie, et revient si cette adresse est supprimée`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
