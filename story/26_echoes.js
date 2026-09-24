CANDLE.script(String.raw`
// ---------------------------------------------------------------- echoes
// What the people of the Glass say about the Narrows light and the Warden's
// refused notice, once the Examiner knows about them.

== hut_narrows
AINO: She goes still in the way she goes still before she decides whether to hit you. "You went out there."
* "I didn't know what it was until I saw it." -> hut_narrows_2
* "He kept it for my brother." -> hut_narrows_brother

== hut_narrows_2
AINO: "Nobody knows what it is. Everybody knows it's there." She looks at the stove. "He never let me come. Not once. I'd follow him and he'd send me back from the last post. He said it was his. He said some things you carry by yourself or they don't count."
=> hut_narrows_3

== hut_narrows_brother
AINO: She looks at you for a long time. "*You're* F.M.'s," she says slowly. "I always thought F.M. was a girl. Somebody he'd loved. I made up a whole story when I was eleven." A short, raw laugh. "She had red hair."
=> hut_narrows_3

== hut_narrows_3
@if na_lit
> You tell her it was still burning when you got there. You tell her it was almost out, and that you lit it again.
AINO: She doesn't say anything. She puts her hand over her mouth and keeps it there, and her shoulders go up, once, and down.
AINO: When she takes her hand away she says, quite steadily: "Somebody has to go out at dusk. Every dusk. All winter." She looks at the rope coil by the stove. "I suppose that's the Warden, now."
@add aino 2
@add thaw 1
@set aino_narrows
@elif na_out
> You tell her it went out while you watched.
AINO: "Of course it did." Flat. "He lit it this morning. Candles don't know who's dead." She turns her face to the wall. "Get out, Examiner. Please."
@add aino -1
@else
> You tell her it was guttering when you left.
AINO: She stands up. She takes a jar from the shelf, and a stub of candle, and puts them in her coat pocket, and sits down again, and doesn't explain. She doesn't need to.
@add aino 1
@set aino_narrows
@endif
=> hut_talk

== cp_narrows
HESPER: She sets down her tea very carefully, as though it had become heavy. "Every Sunday," she says. "Forty-four winters. He came for one jar and one candle, and he paid for them with a fish, and he never once told me what they were for, and I never once asked." She smiles at the mug. "I knew, of course. The whole Glass knew. That's the Glass. Everybody knows, and nobody says, and it's a sort of love, I think, or a sort of cowardice, and I've stopped being able to tell the difference."
HESPER: "I used to go out on Monday mornings and check it was still lit. I told myself that was pastoral. It was nosiness." A pause. "It was always lit."
@if knows_rescue
HESPER: She looks at you over the mug, and her old eyes are very kind and not at all soft. "It's yours, isn't it. The F.M."
* "It was my brother's." -> cp_narrows_yes
* [Nod. You can't say anything.] -> cp_narrows_yes
@else
=> cp_talk
@endif

== cp_narrows_yes
HESPER: "Then you'll want this." She reaches under her stool and brings up a jar — clean, a new stub of candle already in it — and puts it in your hands. "It was for tomorrow. Sunday. He'd have come for it." She pats your fingers closed around it, briskly, the way you'd tuck in a child. "Take it. I'd rather it went to family."
@set has_hesper_jar
@add thaw 2
@morale 1
=> cp_talk

== bo_lamp
MOTH: "The Mutual doesn't buy newspapers, Examiner." He sips his tea. "It buys the space next to them. Page one, top right, in perpetuity. *The Great Mutual: Every Life Accounted For.*" A small, dry pause. "It's been very effective."
* "And if the Lamp printed that the Glass was rotten?" -> bo_lamp_2
* "Then who told Wren Aske the Warden was drunk?" -> bo_lamp_3

== bo_lamp_2
MOTH: "Then the Mutual would reprice the Glass by morning, and every policyholder on it would be informed, individually, by post." He sets down the cup. "By *post*, Examiner. Delivered Thursday." He looks at the adding machine as if it had said something vulgar. "Newspapers are faster than we are. It's one of the few things I envy them."
=> bo_talk

== bo_lamp_3
MOTH: "Not the Mutual." He says it with the precise weariness of a man who has been blamed for a great many things and is only now being blamed, for once, for the wrong one. "We have no interest in a drunk Warden. A drunk Warden is a *misadventure*. Misadventure pays in full." A thin smile. "It's the Works who'd like him drunk. Drunks don't need thermometers."
@set moth_blames_works
=> bo_talk

== wa_notice
> You hand him the grey half-sheet with its double underline. Pim reads it standing, lips moving slightly, the way he reads the Handbook.
PIM: When he gets to the end he reads it again. Then he sits down on the cot, rather suddenly, as if his knees had been told something before the rest of him.
PIM: "I saw him go in there," he says. "The *Lamp*'s sledge. Last Friday. I thought he was going to sell a story about the Chandelier. Everybody said he'd sell anything." He looks at the paper. "He came out without his hat. I thought he'd forgotten it. I thought he was drunk."
PIM: "*I am not drunk.*" He touches the underline with one finger, very lightly, as if it might still be wet. "He underlined it twice, sir."
* "Nobody believed him, Pim. It wasn't only you." -> wa_notice_kind
* "Then believe him now. Tonight." -> wa_notice_now

== wa_notice_kind
PIM: "That's worse, sir," he says, quite simply. "That's much worse. That means it was everybody." He gives you the notice back, carefully, with both hands, the way you'd hand back a baby. "I'd like to be the one that wasn't. Next time."
@add pim 1
@add thaw 1
=> wa_talk

== wa_notice_now
PIM: He stands up. He puts on his cap, and straightens it, and for a moment looks exactly like the drawing on the Handbook's frontispiece of THE CONSTABLE, MINDFUL OF HIS DUTY. "Yes, sir," he says. "Tonight."
@add pim 2
@set pim_ready
=> wa_talk

== me_wren
MARTA: "Wren Aske!" A shriek of delight that makes the coats sway. "I mend her coats. She wears them out at the elbows, leaning on that stone of hers. She and my Ilsie—" She stops, and looks at her daughter, and changes her mind about something. "They were thick as thieves. Two girls from the Glass in that great cold Office. I used to feed them both on Sundays."
ILSE: "Mother."
MARTA: "And then there was some business with a newspaper and a dog, and neither of them would tell me what, and neither of them has come to Sunday dinner together since." She shakes her head, pins bristling. "Nine years. Over a *dog*."
ILSE: Very quietly, to the coats: "It wasn't about the dog."
@set knows_wren_ilse
=> me_talk
`);
