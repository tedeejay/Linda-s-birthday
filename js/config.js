/* ==========================================================================
   ✎ EDIT THIS FILE to personalise the whole website.
   Everything Linda sees — the letter, captions, photos, reasons, the final
   message — lives here. You never have to touch the other files.
   ========================================================================== */

window.BIRTHDAY_CONFIG = {

  /* Her name / nickname, shown in big letters on page 1 and page 5 */
  name: "Baby",

  /* The countdown target.
     Format: YYYY-MM-DDTHH:MM:SS+HH:MM  (the +03:00 at the end is the timezone;
     change it if she lives in a different timezone, so the countdown hits zero
     at HER midnight). */
  birthday: "2026-11-28T00:00:00+03:00",

  /* Music: replace assets/audio/music.mp3 with your own song (keep the name),
     or change the path here. Volume goes from 0 (silent) to 1 (full). */
  music: "assets/audio/music.mp3",
  musicVolume: 0.6,

  /* If true, the music starts by itself the moment she unlocks the page with the
     passcode (browsers don't allow sound before a tap, so this is the earliest
     moment it can start). She can still pause it with the music button. */
  startMusicOnBegin: true,

  /* Passcode shown on page 1. Give it to her on the day. 4 digits. */
  passcode: "1920",

  /* ------------------------------------------------------------------ PAGE 2 */
  letter: {
    greeting: "My dearest Baby,",
    paragraphs: [
      "Happy Birthday, my love. I wanted to give you something that feels as special as you are, so I built you a little world — made only for you.",
      "The day you were born, the world got a little softer and a lot brighter. You walked into my life and quietly made everything more beautiful than I ever knew it could be.",
      "You are my calm after a long day, my favourite laugh, and my safest place. With you, even the simplest moments turn into memories I want to keep forever.",
      "On your birthday I wish you every kind of happiness — the loud kind and the quiet kind, the kind you can see and the kind only your heart can feel. May this year love you back as gently and as fully as you love everyone around you.",
      "Thank you for being you, for choosing me, and for all the little things you do that you probably don’t even notice. I love you more than these words could ever hold."
    ],
    closing: "Forever yours,",
    signature: "Jay 💜"
  },

  /* ------------------------------------------------------------------ PAGE 3
     Add, remove or reorder photos freely (6 or more looks best).
     To use your real pictures: copy them into assets/images/ and change the
     `src` below, e.g.  src: "assets/images/us-at-the-beach.jpg"            */
  photos: [
    { src: "assets/images/photo-1.jpg", caption: "That smile of yours" },
    { src: "assets/images/photo-2.jpg", caption: "Soft light, big smile" },
    { src: "assets/images/photo-3.jpg", caption: "My playful rose" },
    { src: "assets/images/photo-4.jpg", caption: "Pure sunshine" },
    { src: "assets/images/photo-5.jpg", caption: "Your laugh, my favourite sound" },
    { src: "assets/images/photo-6.jpg", caption: "Quiet beauty" },
    { src: "assets/images/photo-7.jpg", caption: "Hearts all over, just like mine" },
    { src: "assets/images/photo-8.jpg", caption: "The cutest pout in the world" }
  ],

  /* ------------------------------------------------------------------ PAGE 4
     Five cards. She taps a card and it flips to show the message.         */
  reasons: [
    {
      icon: "😊",
      title: "Your smile",
      text: "It’s the first thing I notice and the last thing I think about before I sleep. One smile from you and whatever kind of day I’ve had simply melts away."
    },
    {
      icon: "💗",
      title: "Your beautiful heart",
      text: "You love so gently and so fully. The way you care for people, quietly and without keeping score, is the most beautiful thing about you."
    },
    {
      icon: "🌸",
      title: "Your personality",
      text: "You’re warm, funny and unmistakably you. You make even the most ordinary moments feel like something worth remembering."
    },
    {
      icon: "🥰",
      title: "The way you make me happy",
      text: "A message from you, the sound of your laugh, just knowing you’re mine — you make me happy in ways you don’t even realise."
    },
    {
      icon: "💎",
      title: "Why you are irreplaceable",
      text: "There is no one else like you, and there never will be. You can’t be compared or replaced, Baby — you are my one and only."
    }
  ],

  /* ------------------------------------------------------------------ PAGE 5 */
  finalMessage: {
    paragraphs: [
      "You are loved more than you will ever know — today and every single day.",
      "Thank you for being my favourite person in the whole world. Make a wish, my love, and I’ll spend my life helping it come true."
    ],
    signature: "Happy Birthday, my love 💜"
  }
};
