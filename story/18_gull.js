CANDLE.script(String.raw`
== gu_enter
@bg gull
@title THE CHESTNUT BRAZIER
@sfx fire
@if seen("gu_enter") > 1
@time 10
=> gu_return
@endif
@time 20
@sfx fire
> At the corner where Needle Row meets the main lane, a brazier made from an old oil drum glows red through the holes punched in its sides. Chestnuts split and hiss on the grille. Crouched beside it on an upturned crate, feeding it splinters, is a boy of ten or so in a man's cap and a constable's grey scarf wound three times round his neck.
GULL: He looks you up and down with professional interest. "Chestnuts. Ten a cone, three cones for a crown, Examiner's price double." A beat. "Joke. Half price. You look like you need it."
* "Why half price?" -> gu_half
* "You're the boy who found him." -> gu_found
* [Buy a cone of chestnuts.] -> gu_buy

== gu_half
GULL: "You've got a sad coat." He says it with total sincerity. "Sad coats get half price. It's a rule I made."
TENDERNESS: He's not being cruel. He's being accurate. There's a difference, and children know it better than anyone.
=> gu_talk

== gu_buy
@insert v_chestnuts
@sfx paper
> He shovels hot chestnuts into a paper cone with a practised flick and holds out a mittened hand. You pay him. He counts it twice.
APPETITE: Hot. Split. The flesh inside floury and sweet. You burn your fingers on the first one and don't care.
@health 1
@add gull 1
=> gu_talk

== gu_found
GULL: The professional look goes. For a moment he is just ten. "I was sliding." Very quietly. "On the black bit, by the steps. You get the best slide there. I slid right over his face."
=> gu_found_2

== gu_return
GULL: "Examiner! Back for more?" He's already reaching for a cone.
=> gu_talk

== gu_talk
+ {!seen("gu_found")} "You found him, didn't you." -> gu_found
+ {!seen("gu_msgs")} "What do you do for the people on the Glass?" -> gu_msgs
+ {!seen("gu_aino")} "Do you know the Warden's granddaughter?" -> gu_aino
+ {!seen("gu_knock")} [He's watching the ice by the brazier very carefully. Ask him why.] -> gu_knock
+ {!seen("gu_worth")} "What's that stamped on your papers?" -> gu_worth
+ {!seen("gu_buy")} [Buy a cone of chestnuts.] -> gu_buy
+ {gull >= 2 && !gull_runner} "If I needed a message carried tonight — fast — would you do it?" -> gu_runner
+ [Leave the brazier.] -> gu_leave

== gu_found_2
GULL: "His eyes were open. I said sorry." He looks at you anxiously. "You're supposed to say sorry if you slide on someone. Aren't you? Even if they're under?"
* "Yes. You did exactly right." -> gu_found_right
* "He wouldn't have minded. Wardens are used to people on top of them." -> gu_found_joke
* "What else did you see?" -> gu_found_else

== gu_found_right
GULL: Something in his shoulders comes down about an inch. "Good. Good. That's what I thought."
@add gull 1
=> gu_found_else

== gu_found_joke
GULL: He stares at you. Then, suddenly, horribly, he laughs — the laugh of a child who has been holding something all afternoon and has just been given permission to put it down. "He *would* be. He'd have said *mind my face, you little gull*."
@add gull 2
=> gu_found_else

== gu_found_else
GULL: "His hand was up. Like this." He shows you, pressing his mittened palm flat against the air. "Like he was knocking on a window. Ma says the drowned knock for a year and a day. But he wasn't knocking. I watched a long time before I shouted. He wasn't doing anything. He was just *up*." He looks at the brazier. "I gave the constable his scarf back but he said keep it. The clerk lady gave him hers. So now he's got a lady's scarf and I've got a constable's."
@xp 5
=> gu_talk

== gu_msgs
GULL: "Messages." Proudly. "One chestnut a message, anywhere on the Glass. Two to the shore. Three if it's the Works, the Works has dogs." He counts on his mittens. "I do the Chandelier, the Mutual man, the bathhouse, the chapel, the Cutters, Needle Row — everyone. I know everyone's business, because I carry it."
GULL: "The Warden sent me five days ago. Three letters. One to the night man at the Works. One to the Mutual man. One to the priest lady. He paid me in fish, which isn't the rate, but he's the Warden." A pause. "Was."
* "Did anyone answer?" -> gu_msgs_answer
* "Anything else you carried this week?" -> gu_msgs_else

== gu_msgs_answer
GULL: "The priest lady cried. The night man at the Works said *tell him I can't* and shut the door. The Mutual man wrote something back, very neat, and gave me a whole crown for it." He scowls. "The Warden read it and put it in the stove."
@clue gull_msgs Five days ago the Warden sent Gull with letters to Quell, to Moth and to the Deaconess. Quell said "tell him I can't". Moth wrote back; the Warden burned the reply.
@xp 10
=> gu_msgs_else

== gu_msgs_else
GULL: "The Mutual man went to the Works himself. Two nights ago. On his own, no message, in his good coat. I saw him go in the gate." Gull lowers his voice. "He came out after ten minutes looking like he'd swallowed a spoon."
OBJECTION: Moth. At the Works. Two nights ago. Asking for better figures — and being refused? Or being told them?
@set moth_went_works
@clue moth_works Two nights ago Perrin Moth went to the Cold Works alone and came out "looking like he'd swallowed a spoon."
@xp 10
=> gu_talk

== gu_aino
GULL: "Aino's my friend." Instantly, fiercely. "She's teaching me the ice. How to drill, and what the colours mean — black's good, white's worse, grey's *bad*. She says the Warden could hear the ice laughing." He puts his ear to the ice by the brazier, cap and all, and listens, frowning. "I can't hear it. I've tried every night."
GULL: "She ran past last night. At half past three. In her socks. Crying. I called and she didn't stop." He sits up. "Is she in trouble?"
* "No. She's not in trouble." -> gu_aino_no
* "I don't know yet." -> gu_aino_dunno

== gu_aino_no
GULL: "Good." He goes back to the chestnuts with great concentration. "Because if she was, I'd have to do something, and I don't know what."
@add gull 1
=> gu_talk

== gu_aino_dunno
GULL: "Then find out." A command, from a ten-year-old in a constable's scarf. "Find out, and then she's not."
=> gu_talk

== gu_knock
GULL: "Because I'm listening." He doesn't look up from the ice. "For him. Ma says they knock for a year and a day. If he knocks, I'm going to knock back. Three times. So he knows someone heard." A pause. "Will he? Knock? Forever?"
* "No. He's not knocking. He's resting." -> gu_knock_rest
* "The dead don't knock, Gull. That's just the ice." -> gu_knock_ice
* "If he does, knock back. That's exactly right." -> gu_knock_back

== gu_knock_rest
GULL: He considers this. "Like sleeping."
TENDERNESS: Like sleeping. It isn't true and it isn't a lie. It's the thing you say to a child at a brazier at night, and you've said it at four hundred inquests to four hundred children, and it has never once felt like this.
@add gull 1
=> gu_talk

== gu_knock_ice
GULL: "I know it's the ice." Scornfully. "*Everybody* knows it's the ice. That's not the point." He goes back to listening.
UNDERTOW: That's not the point. He's ten, and he's right, and you've been getting it wrong for forty-four years.
@add thaw 1
=> gu_talk

== gu_knock_back
GULL: He nods, satisfied, like a man who has had a legal point confirmed by a higher court. "Three times. Yes."
> He raps three times on the ice with his mittened knuckles — *tok, tok, tok* — and then looks up at you, waiting.
* [Knock three times too.] -> gu_knock_you
* [Watch him.] -> gu_talk

== gu_knock_you
@sfx knock
> You crouch — your knees object — and knock three times on the ice beside his mitten. *Tok. Tok. Tok.* A grown man in the Crown's coat knocking on the floor of a frozen harbor next to a chestnut boy.
GULL: He grins at you, sudden and enormous. "Now he knows two people heard."
@add gull 2
@add thaw 1
@set knocked_with_gull
=> gu_talk

== gu_worth
GULL: He pulls a battered paper from inside his coat and shows you the back without embarrassment, the way you'd show someone a scar. A violet stamp: 400.
GULL: "Four hundred. Same as a funeral. Ma says that's what I'll cost if I fall in — the box and the priest and a month's rent." He puts it away. "The Warden said that's the only honest number the Mutual ever printed, because a funeral's the only thing they know the price of."
KEEL: A ten-year-old boy carrying his own funeral in his coat. Breathe.
* "You're worth more than that." -> gu_worth_more
* "It's just a number, Gull." -> gu_worth_number

== gu_worth_more
GULL: "I know." Matter-of-fact. "I'm worth *four hundred and a brazier*." He pats the drum. "The brazier's mine. I built it."
@add gull 1
=> gu_talk

== gu_worth_number
GULL: "Everything's just a number." He shrugs. "Till it isn't."
@align unpriced 1
=> gu_talk

== gu_runner
GULL: He sits up straight, all business. "Fast?" He pulls the constable's scarf tighter. "I'm the fastest on the Glass. I can do the Chandelier to the Works in nine minutes if I slide the black bits." He holds out a mitten. "Rate's one chestnut. For you, free. You've got a sad coat."
@set gull_runner
@clue gull_runner Gull will carry one urgent message for you tonight, anywhere on the Glass.
=> gu_talk

== gu_leave
GULL: As you go: "Examiner!" He throws something. You catch it: one hot chestnut, split open. "For the road."
=> hub2
`);
