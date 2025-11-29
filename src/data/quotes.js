const quotes = [
  {
    quote: "I have told my sons that they are not under any circumstances to take part in massacres, and that the news of massacres of enemies is not to fill them with satisfaction or glee.",
    speaker: "Kurt Vonnegut",
    work: "Slaughterhouse-Five",
    medium: "book"
  },
  {
    quote: "He supposed that the intent of the Gospels was to teach people, among other things, to be merciful, even to the lowest of the low.<br><br>But the Gospels actually taught this:<br><br>Before you kill somebody, make absolutely sure he isn't well connected.<br><br>So it goes.",
    speaker: "Kurt Vonnegut",
    work: "Slaughterhouse-Five",
    medium: "book"
  },
  {
    quote: "He could find no explanation for why the song had affected him so grotesquely. He had supposed for years that he had no secrets from himself. Here was proof that he had a great big secret somewhere inside, and he could not imagine what it was.",
    speaker: "Kurt Vonnegut",
    work: "Slaughterhouse-Five",
    medium: "book"
  },
  {
    quote: "Those who are afraid to fail will coast through life and never come close to their potential. Failure—honest failure despite genuine effort—is a sign that one is striving at close to full capacity. If you’re not failing from time to time, you’re not pushing yourself. And if you’re not pushing yourself, your life, when you look back on it, is destined to be a sorry litany of mightas and couldas.",
    speaker: "William Zinsser",
    work: "The Right to Fail",
    medium: "speech"
  },
  {
    quote: 'A man may skin himself seventy times seven times without being able to say, “Now that is truly you; that is no longer your outside.”',
    speaker: "Friedrich Nietzsche",
    work: "Schopenhauer as Educator",
    medium: "essay"
  },
  {
    quote: "There is but one truly serious philosophical problem, and that is suicide.",
    speaker: "Albert Camus",
    work: "The Myth of Sisyphus",
    medium: "essay"
  },
  {
    quote: "No one can build you the bridge on which you, and only you, must cross the river of life.",
    speaker: "Friedrich Nietzsche",
    work: "Schopenhauer as Educator",
    medium: "essay"
  },
  {
    quote: "There is no drearier, sorrier creature in nature than the man who has evaded his own genius.",
    speaker: "Friedrich Nietzsche",
    work: "Schopenhauer as Educator",
    medium: "essay"
  },
  {
    quote: "Life is pain, Highness. Anyone who says differently is selling something.",
    speaker: "The Man in Black",
    work: "The Princess Bride",
    medium: "movie"
  },
  {
    quote: "The trouble with the world is that the stupid are cocksure and the intelligent are full of doubt.",
    speaker: "Bertrand Russell"
  },
  {
    quote: "How do you make God laugh? Tell him your plans.",
    speaker: "Yiddish Proverb"
  },
  {
    quote: "If the process is sound, the product takes care of itself.",
    speaker: "William Zinsser",
    work: "On Writing Well",
    medium: "book"
  },
  {
    quote: "A little pain<br>never hurt anyone.",
    speaker: "Margo Price",
    work: "A Little Pain",
    medium: "song"
  },
  {
    quote: "Only to the extent that we expose ourselves over and over to annihilation can that which is indestructible be found in us.",
    speaker: "Pema Chödrön",
    work: "When Things Fall Apart",
    medium: "book"
  },
  {
    quote: "If the universe is meaningless, so is the statement that it is so. The meaning and purpose of dancing is the dance.",
    speaker: "Alan Watts",
    work: "The Wisdom of Insecurity",
    medium: "book"
  },
  {
    quote: "The trick, William Potter, is not minding that it hurts.",
    speaker: "T.E. Lawrence",
    work: "Lawrence of Arabia",
    medium: "film"
  },
  {
    quote: "This is the secret of the arts: always be a beginner.",
    speaker: "Shunryu Suzuki",
    work: "Zen Mind, Beginner’s Mind",
    medium: "book"
  },
  {
    quote: "It is the job of thinking people not to be on the side of the executioners.",
    speaker: "Albert Camus"
  },
  {
    quote: `unless being still would<br>drive you to madness or<br>suicide or murder,<br>don’t do it.`,
    speaker: "Charles Bukowski",
    work: "so you want to be a writer?",
    medium: "poem"
  },
  {
    quote: "Writing about music is like dancing about architecture.",
    speaker: "Martin Mull"
  },
  {
    quote: "Sometimes, magic is just someone spending more time on something than anyone else might reasonably expect.",
    speaker: "Teller"
  },
  {
    quote: "I am a brief light that flashes but once in all the aeons of time.",
    speaker: "Alan Watts",
    work: "The Book"
  },
  {
    quote: "One does not go to see Humphrey Bogart as Sam Spade: one goes to see Sam Spade as Humphrey Bogart.",
    speaker: "James Baldwin",
    work: "The Devil Finds Work",
    medium: "essay"
  },
  {
    quote: "I’m your huckleberry.",
    speaker: "Doc Holliday",
    work: "Tombstone"
  },
  {
    quote: "If you run into an asshole in the morning, you ran into an asshole. If you run into assholes all day, you’re the asshole.",
    speaker: "Raylan Givens",
    work: "Justified",
  },
  {
    quote: "The Dude abides.",
    speaker: "The Dude",
    work: "The Big Lebowski"
  },
  {
    quote: "There are two kinds of people in this world. Those with loaded guns, and those who dig. You dig.",
    speaker: "Blondie",
    work: "The Good, the Bad, and the Ugly"
  },
  {
    quote: "That’ll be the day.",
    speaker: "Ethan Edwards",
    work: "The Searchers"
  },
  {
    quote: `We rip out so much of ourselves to be cured of things faster that we go bankrupt by the age of thirty and have less to offer each time we start with someone new. Right now there's sorrow, pain. Don't kill it, and with it, all the joy you've felt.`,
    speaker: "Mr. Perlman",
    work: "Call Me By Your Name",
  },
  {
    quote: "To wives, and sweethearts. May they never meet.",
    speaker: "Captain Jack Aubrey",
    work: "Master and Commander: The Far Side of the World"
  },
  {
    quote: `“I wish it need not have happened in my time,” said Frodo.
    <br>
    <br>
    “So do I,” said Gandalf, “and so do all who live to see such times. But that is not for them to decide. All we have to decide is what to do with the time that is given us.”`,
    speaker: "Frodo Baggins and Gandalf the Grey",
    work: "The Fellowship of the Ring",
  },
  {
    quote: "The teeth? We don’t know. Signs from Hashem? Don’t know. Helping others? Couldn’t hurt.",
    speaker: "Rabbi Nachtner",
    work: "A Serious Man"
  },
  {
    quote: "In the end we blew off the last three pubs and headed for the hills. I sat up there, blood on my knuckles, beer down my shirt, sick on my shoes, knowing in my heart life would never feel this good again. And you know what? It never did.",
    speaker: "Gary King",
    work: "The World’s End"
  },
  {
    quote: "If it was never new and it never gets old, then it’s a folk song.",
    speaker: "Llewyn Davis",
    work: "Inside Llewyn Davis"
  },
  {
    quote: "I do not entertain hypotheticals. The world as it is is vexing enough.",
    speaker: "Col. Stonehill",
    work: "True Grit",
    year: 2010
  },
  {
    quote: "Fill your hands, you son of a bitch!",
    speaker: "Rooster Cogburn",
    work: "True Grit"
  },
  {
    quote: "I am Iron Man.",
    speaker: "Tony Stark",
    work: "Iron Man"
  },
  {
    quote: "I. Drink. Your. MILKSHAKE!",
    speaker: "Daniel Plainview",
    work: "There Will Be Blood"
  },
  {
    quote: "When the legend becomes fact, print the legend.",
    speaker: "Maxwell Scott",
    work: "The Man Who Shot Liberty Valance"
  },
  {
    quote: "Thrill me.",
    speaker: "Detective Ray Cameron",
    work: "Night of the Creeps"
  },
  {
    quote: `And should we win the day, the Fourth of July will no longer be known as an American holiday, but as the day when the world declared in one voice:
    <br>
    <br>
    “We will not go quietly into the night! We will not vanish without a fight! We’re going to live on! We’re going to survive!”
    <br>
    <br>
    Today, we celebrate our Independence Day!`,
    speaker: "President Thomas J. Whitmore",
    work: "Independence Day",
  },
  {
    quote: "It’s okay with me.",
    speaker: "Philip Marlowe",
    work: "The Long Goodbye"
  },
  {
    quote: "Get busy livin, or get busy dyin.",
    speaker: "Red",
    work: "Rita Hayworth and the Shawshank Redemption"
  },
  {
    quote: "I’m Dapper Dan man, dammit!",
    speaker: "Ulysses Everett McGill",
    work: "O Brother, Where Art Thou?"
  }
]

export default quotes