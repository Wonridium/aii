CANDLE.script(String.raw`
// Additional conversations with Ilse Varga, reached from il_talk.

== il_gloves
ILSE: She looks at her own hands as though noticing them for the first time: grey Office gloves with the fingertips cut neatly away, the edges whipped with grey thread so they won't fray.
ILSE: "So I can feel the pencil." She flexes her fingers. "You can't write the truth in gloves. It comes out blunt."
ILSE: "My mother cut the first pair when I was eight. For the Record, under the table. I've cut every pair since." A pause. "The Office sends me a memorandum about it every winter. Uniform regulations, section four. I file it."
* "In the Record?" -> il_gloves_rec
* "They suit you." -> il_gloves_suit

== il_gloves_rec
ILSE: "In the stove." Deadpan. It takes you a moment to realise she has made a joke, and another to realise she is watching to see whether you noticed.
@add ilse 1
=> il_talk

== il_gloves_suit
ILSE: "They're regulation gloves with the ends cut off, Examiner." But she tucks her hands into her sleeves, and something about the set of her shoulders is pleased.
=> il_talk

== il_super
ILSE: "Superintendent Grieve." She considers how to put it. "He keeps a canary in his office called Precedent. It hasn't sung since the Settlement centenary. He believes it's thinking."
ILSE: "He signs everything in green ink, because he read that the old Crown did. He eats one pickled onion at eleven every morning, from a jar in his desk. He has never once in my hearing said anything kind about anyone."
* "And he sent me here." -> il_super_sent
* "That sounds like him." -> il_super_sent

== il_super_sent
ILSE: "He did." She hesitates — which, for Ilse, is a thing that takes visible effort. "When the wire came this morning, there were three Examiners free. Holt, Pasquier and you. Holt was nearer. Pasquier asked for it."
ILSE: "Grieve read the Warden's letter and said, 'Marrow.' Then he said — I was in the room, taking the minute — 'Marrow has been walking the long way round the bay for thirty years. Time he stopped.'"
ILSE: "Not entered," she adds. "Obviously."
TENDERNESS: The man with the canary and the green ink and the pickled onion. He noticed. Of everyone, *he* noticed.
@add thaw 1
@add ilse 1
=> il_talk

== il_father
ILSE: She is quiet for a while. "My mother told you. About the fingers."
ILSE: "He sends a card at the Lantern Feast. Every year. Nine of them now. I keep them in a drawer in the Office, under the carbon paper." A pause. "I've never opened one."
* "Why not?" -> il_father_why
* "Maybe you should open one." -> il_father_open
* "You don't owe him anything." -> il_father_owe

== il_father_why
ILSE: "Because if it says nothing, I'll be angry. And if it says something, I'll have to answer it." She says it with the flat precision of a woman reading out a statement she has rehearsed for years. "The drawer is easier. The drawer doesn't need an answer."
KEEL: A drawer. Things too cold to handle, put in a drawer and left to set. You know a little about that.
@add thaw 1
=> il_talk

== il_father_open
ILSE: "One." She turns the word over. "One would be manageable. One would be — a sample." Something almost like a smile. "The Office approves of samples."
@set ilse_card
@add ilse 1
=> il_talk

== il_father_owe
ILSE: "No." She agrees at once, and then, a few steps later, less certainly: "No. I don't."
=> il_talk

== il_write
ILSE: "Do I—" She stops walking. "My mother. Of course." She closes her eyes briefly. "She's been telling everyone on Needle Row for fifteen years that I'm going to be a writer."
* "Are you?" -> il_write_are
* "What would you write?" -> il_write_what

== il_write_are
ILSE: "I'm a clerk of the Inquest Office." It comes out as though from a card. Then, quieter: "I write in the evenings. Sometimes. It's nothing."
=> il_write_what

== il_write_what
@if ilse >= 3
ILSE: She is quiet a long time. "A clerk," she says finally. "Who types other people's Last Lines. Four thousand of them. Every one perfect. And every night she goes home and writes down the things that weren't in them — the widow's hands, the dog, the way a man laughed at the wrong moment — in a little black book." A pause. "It isn't going anywhere. It doesn't have an ending."
ILSE: "I thought perhaps it was a story about someone who never writes her own." She looks at you sidelong. "I'm told that's a common theme on the Third Bench."
@add thaw 1
@add ilse 1
@else
ILSE: "Things that don't go in the record." She walks on. "That's all I'll say, Examiner. It's cold."
@endif
=> il_talk

== il_verdict
ILSE: "My Last Line?" She almost laughs. "Clerks don't have Last Lines, Examiner. We have the Examiner's."
@if ilse >= 3
ILSE: But she thinks about it — you can watch her think about it, the way she weighs a doubtful word in a statement. "Misadventure. Because the girl needs to eat, and because it's defensible, and because I'm a coward." A pause. "Or — no. No, that's what I'd *type*." She looks out at the dark edge of the Glass, where the hut is. "What I'd write is that he went down there so somebody would listen. And there's no drawer for that."
@if !known("fifth")
@thought fifth
@endif
@else
ILSE: "Whatever you dictate. Correctly spelled." She says it lightly. It doesn't sound light.
@endif
=> il_talk

== il_afraid
ILSE: "Yes." At once, without ornament. "I grew up on this ice. Every winter until I was eighteen. I know what it sounds like when it's good and I know what that" — the thin high laughing, under your feet — "means."
ILSE: "My father lost his fingers on a night that sounded like this. He was cutting on the north field and it opened under the saw." She looks at her own gloved hands. "I've been afraid of it since I was six. I became a clerk so I could live in a building with a cellar."
* "So did I. Not a clerk — but the long way round the bay." -> il_afraid_me
* "Then why come back?" -> il_afraid_why

== il_afraid_me
ILSE: She looks at you. "The long way round the bay." Something in her face opens very slightly. "Every morning. Thirty years. I've watched you do it from the tram."
ILSE: "I thought you liked the view."
@add ilse 1
@add thaw 1
=> il_talk

== il_afraid_why
ILSE: "I told you. Somebody should be there." She pulls the scarf that isn't there tighter round her throat, and remembers she gave it to Pim. "It's harder to be afraid when you're writing things down. You're too busy spelling."
=> il_talk

== il_clara
ILSE: "Once." She seems to decide something. "Five years ago. She came to the front desk of the Office on a Tuesday afternoon with a parcel. She asked for you. You were at the Harrowgate exhumation."
ILSE: "She left the parcel with me. It was a teapot. Brown, with a chip on the spout. There was a note tied to the handle." She keeps her eyes on the lanterns. "I put it in the lost-property cupboard with a docket, as regulations require, and I sent you a memorandum. You never collected it."
* "The good teapot." -> il_clara_pot
* "What did the note say?" -> il_clara_note
* "I never read the memorandum." -> il_clara_memo

== il_clara_pot
ILSE: "Is it?" She considers this. "It's still there. Third shelf. Docket twenty-one-oh-six. Between an umbrella and a glass eye."
@set knows_teapot
@add thaw 1
=> il_talk

== il_clara_note
ILSE: "It was addressed to you, Examiner. I don't read the Examiner's correspondence." A pause of perfect length. "It was also not sealed. It said: *You were right about the chip. It pours better. — C.*"
TENDERNESS: The chip on the spout. You said once, at breakfast, in the fourth year, that the chip made it pour better. She laughed and said it was the most romantic thing you'd ever said. It was.
@set knows_teapot
@add thaw 2
@morale -1
=> il_talk

== il_clara_memo
ILSE: "No." Neutral. "You read every memorandum. You initial them. You never initialled that one." She looks at you. "I assumed you had your reasons."
@set knows_teapot
=> il_talk

== il_why_me
ILSE: She actually stops walking. "Put up with you."
@if ilse >= 4
ILSE: "You say *please* to witnesses. You stand up when a widow comes into the room, even when your knees are bad. You wrote the *Brisk* Lines through a whole night so each woman had her own, and you never once told anyone you did it." She starts walking again. "And you walk the long way round the bay every morning. For thirty years. I thought anyone who was that afraid of something, and went to work every day anyway, was worth typing for."
@add thaw 2
@elif ilse >= 2
ILSE: "You're correct," she says. "You're the most correct Examiner on the Bench. It's restful, typing for someone who never needs correcting." A pause. "Mostly."
@else
ILSE: "It's my assignment, Examiner." And then, as if hearing how that sounds: "I'm sorry. It's cold. Ask me again another night."
@endif
=> il_talk
`);
