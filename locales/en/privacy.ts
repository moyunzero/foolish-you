/** In-app privacy policy (en). Keep in sync with docs/privacy.html en section. */

export const privacy = {
  title: 'Privacy Policy',
  sections: [
    {
      title: 'Overview',
      paragraphs: [
        'Silly Me (“the App”) is provided by mo yun (individual developer). We respect your privacy. This policy explains what the App does — and does not do — with your information.',
        'The App is an offline-first daily puzzle game: puzzles are generated on your device. No account is required.',
      ],
    },
    {
      title: 'We do not collect personal data',
      paragraphs: [
        'The App does not ask for your name, email address, phone number, or other personally identifiable information.',
        'We do not upload game data to our servers, and we do not operate a user account system for tracking you (v1 has no login).',
        'The App does not integrate third-party advertising SDKs or analytics services (such as Firebase Analytics) to collect usage behavior or build profiles.',
      ],
    },
    {
      title: 'Data stored only on your device',
      paragraphs: [
        'To support “one puzzle a day” and resume play, the App stores a small amount of game state locally on your device (via AsyncStorage), such as: the current calendar day key, puzzle type, board progress, and start/end times.',
        'This data is used only to restore today’s game on this device. It is not sent to the developer or third-party servers.',
        'You can delete this local data by uninstalling the App or clearing app data in system settings.',
      ],
    },
    {
      title: 'Network and permissions',
      paragraphs: [
        'Core gameplay works without a network connection. If you choose to open the public privacy policy link in the App or visit the GitHub support page, your device will use the browser or network — only when you initiate it.',
        'The App does not require location, contacts, camera, microphone, or other sensitive permissions to play.',
      ],
    },
    {
      title: "Children's privacy",
      paragraphs: [
        'The App does not knowingly collect personal information from children under 13. Because we do not collect personal data, the same “no collection” principle applies when children use the App with a guardian’s consent.',
      ],
    },
    {
      title: 'Policy updates',
      paragraphs: [
        'We may update this privacy policy from time to time. An updated version will replace this page and change the “Last updated” date at the top. If changes materially affect how data is handled, we will provide reasonable notice in the App or on this public page.',
      ],
    },
    {
      title: 'Contact us',
      paragraphs: [
        'Questions about this policy? Reach us via GitHub Issues: https://github.com/moyunzero/foolish-you/issues',
        'The full public policy is also available at: https://moyunzero.github.io/foolish-you/privacy.html',
      ],
    },
  ],
} as const;
