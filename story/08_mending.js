CANDLE.script(String.raw`
== me_enter
@bg mending
@music interior
@title NEEDLE ROW — THE MENDER'S STALL
@if seen("me_enter") > 1
@time 15
=> me_return
@endif
@time 25
> Needle Row is a lane of stalls between two lines of huts, roofed over with sailcloth so that it's like walking down the inside of a long tent. Tinkers. A knife-grinder. A woman selling hot eels in paper cones. And at the end, a stall hung so thick with coats and jackets and trousers that it looks like a crowd of headless people waiting patiently to be finished.
ILSE: She stops walking. "I'll wait here, Examiner."
?{knows_ilse_mother} TENDERNESS: She said it very evenly. You know exactly why she said it.
> Inside the forest of coats, a round woman of sixty-odd with spectacles on a chain and a mouth full of pins is working a treadle machine by lamplight. She glances up at the sound of voices. She looks past you. The pins fall out of her mouth.
MARTA: "*ILSE.* Ilse Varga, you come here this *instant*."
> Ilse closes her eyes for exactly one second. Then she walks, with the dignity of a clerk of the Inquest Office going to her own execution, into the stall, and is seized, and embraced, and rocked from side to side, and kissed on both cheeks and once on the forehead for good measure.
MARTA: "Look at you. *Look* at you. You're thin. Is she thin? She's thin. Are they feeding you in that Office?" This is addressed to you. "You're her superior? Are you feeding her?"
ILSE: Muffled, from inside the embrace: "Mother. This is the Examiner Marrow. Examiner, my mother."
@set knows_ilse_mother
@set met_marta
* "Madame Varga. A pleasure." -> me_hello
* "I've never once seen her eat." -> me_eat
* [Say nothing. Watch Ilse be embraced.] -> me_watch

== me_hello
MARTA: "Madame!" She lets go of Ilse to put her hands on her hips. "Did you hear that, Ilsie? *Madame.* Nobody's called me madame since the Settlement." She beams at you. "Marta. Sit. Sit on that crate, it's only got one nail."
@add ilse 1
=> me_talk

== me_eat
MARTA: "*I knew it.*" She rounds on her daughter with the triumph of a prophet vindicated. "I *knew* it."
ILSE: She gives you a look you will remember for the rest of your life. Then, very faintly, under it, something that might almost be the start of a smile.
@add ilse 1
@add thaw 1
=> me_talk

== me_watch
TENDERNESS: Look at her hands. She's holding them away from her mother, stiff, like someone carrying two full cups. Then — slowly, as if against orders — one of them comes up and rests on her mother's back.
@add thaw 1
=> me_talk

== me_return
MARTA: "Back again! Ilsie, fetch the Examiner the good crate."
ILSE: "There isn't a good crate, Mother."
MARTA: "The *less bad* crate."
=> me_talk

== me_talk
+ {!seen("me_ilse")} "Ilse grew up here?" -> me_ilse
+ {!seen("me_sarre")} "You knew the Warden?" -> me_sarre
+ {seen("me_sarre") && !seen("me_night")} "You said you were there. The night he pulled the boy out." -> me_night
+ {(has_log || knows_candle || proof_fist) && !seen("me_leave_ask")} "Madame Varga — if I asked you to leave the ice tonight, would you?" -> me_leave_ask
+ {!seen("me_mend")} [Your coat's lining has been hanging loose since Sturmhaven. She is looking at it.] -> me_mend
+ {!seen("me_fever")} "Tell me about the Glass. The old days." -> me_fever
+ {met_wren && !seen("me_wren")} "Do you know Wren Aske?" -> me_wren
+ [Take your leave.] -> me_bye

== me_ilse
MARTA: "Under that table." She points with a pair of shears. "From four years old. She'd sit under there with a pencil and a copybook and write down everything the customers said. *Everything.* Things people say when you're letting out their trousers — you would not *believe*."
MARTA: "She called it 'The Record'. Eight years old. 'Mother, I'm keeping the Record.'"
ILSE: "*Mother.*"
MARTA: "She was going to be a writer. Stories. Then she went to your Office and became a machine that writes down other people's words instead." It isn't said cruelly; it is said the way you would say that a river changed its course. "She's very good at it, I hear."
ILSE: Quietly: "I am very good at it."
TENDERNESS: The Record. Things Not Entered. The copybook under the table never stopped; it just went into her coat.
?{nb_me} UNDERTOW: And you're in it now. Somewhere between a widow's husband's hands and a man talking to his dog, there's a page about you.
MARTA: "Her father cut ice. Before the Works. Lost three fingers to it one Deepwinter and went south, to find work where the water stays water." She shrugs. "He sends a card at the Lantern Feast. Ilsie never answers it."
ILSE: "Mother, the Examiner is conducting an *inquest*."
@add thaw 1
@set knows_ilse_past
=> me_talk

== me_sarre
MARTA: "Ailo!" Her face lights and falls in the same instant. "He mended his own socks, badly, and I redid them, and he paid me in fish. Every winter for forty years. I've eaten so much of that man's fish." She presses her lips together. "They say he went under the ice on purpose. I don't believe it. He'd have told me. He told me everything, in socks."
?{knows_rescue} MARTA: She peers at you over her spectacles, suddenly. "Marrow. Ilsie said Marrow." And you watch her face change.
?{!knows_rescue} MARTA: She peers at you over her spectacles. "Marrow. Ilsie said *Marrow*." Something is happening behind her eyes, a long way back, forty-four winters back. "Marrow."
MARTA: "The Marrow *boys*." Her hand goes to her mouth. "Oh, sweet Saint Ondine. You're the little one."
@if !knows_rescue
@set knows_rescue
@done narrows
@thought closer
@done why
@xp 30
ILSE: She has gone absolutely still beside her mother.
UNDERTOW: There it is. From the mouth of a woman with pins on her apron. Forty-four years, and the Glass remembered you the whole time. It just never had your address.
@endif
=> me_talk

== me_night
MARTA: She sits down on her own crate, the one with only one nail. "I was twenty. Just started on the Glass. It was dusk, and someone shouted — *boys on the Narrows* — and the whole Glass came running. You never saw anything like it. A town running."
@insert v_boathook
MARTA: "Ailo got there first. Eighteen. He had a boat-hook. He lay down flat on the ice — that's what you do, you spread yourself out — and he wriggled out to the hole like a seal, and he got the little one by the collar, and he dragged him out, and he threw him back to us, and you were—" she stops. "You were *blue*, love. You were the colour of a mussel."
MARTA: "And then he went back." Her voice drops. "Into the water. Himself. For the other one. Three times. We had to hold him down on the ice in the end, five of us, and he was fighting us, and screaming a name."
* "Feliks." -> me_night_name
* [You can't speak.] -> me_night_silent

== me_night_name
MARTA: "Feliks." She nods slowly. "That was it. Feliks. I never knew whose name it was, till now."
=> me_night_end

== me_night_silent
MARTA: "I never knew whose name it was." She looks at you. "Now I do, don't I."
=> me_night_end

== me_night_end
> You did not know this. You were twelve and blue and wrapped in someone's coat, and nobody ever told you that the man with the boat-hook went into the Basin three times after your brother and had to be held down on the ice by five people.
KEEL: He didn't choose you over Feliks. Hear it. He *tried for both*. He got the one he could reach, and then he went back, and back, and back.
UNDERTOW: Three times. Like knocking.
@set knows_three
@add thaw 2
@morale -1
@xp 15
ILSE: She has put her hand, very lightly, on your sleeve. She takes it away again before anyone, including possibly herself, can notice.
=> me_talk

== me_leave_ask
MARTA: "Leave?" She laughs as though you'd asked her to fly. "Forty-four winters I've been on this ice, love, and I've never once gone ashore before the Warden rang the Thaw Bell. Not once. Not in the fever winter. Not the winter the ice split by the Narrows and took the bathhouse."
MARTA: "Who'll mend them, if I go? Half the coats on this Glass are held together by my thread. Somebody's got to stay till the bell."
ILSE: "Mother—"
MARTA: "When the bell rings, I'll go. Same as always. Same as everyone." She picks up the pins again. "That's what the bell's for."
@set marta_stubborn
@clue marta Marta Varga will not leave the ice until the Warden's Thaw Bell rings. "That's what the bell's for."
UNDERTOW: That's what the bell's for. And the man who rings the bell is under a sheet.
=> me_talk

== me_mend
MARTA: "Give me that coat." It isn't a request. "Your lining's hanging like a drunk's tongue. Off. *Off.*"
> You surrender the coat of the Inquest Office of Aubade to a woman with pins in her mouth. She turns it inside out with a flick, examines the lining with contempt, and runs it through the treadle machine in two long buzzing seams while talking the whole time about the price of thread.
> She hands it back. It is warmer. You don't know how. It is simply warmer.
MARTA: "There. Now you look like someone's looking after you." A glance at her daughter, not subtle at all. "Somebody should be."
@morale 1
@add thaw 1
=> me_talk

== me_bye
@if marta_stubborn
MARTA: She holds Ilse's face between her hands for a moment before letting her go. "Come back before the bell. Both of you. I'll have soup."
@else
MARTA: "Come back! Both of you! I'll have soup!"
@endif
ILSE: Outside, walking, after a long silence: "I'm sorry about that, Examiner."
* "Don't be. I liked her." -> me_bye_liked
* "'The Record.' Eight years old." -> me_bye_record
* [Say nothing.] -> hub2

== me_bye_liked
ILSE: "Everyone likes her." A pause. "That's the problem with her."
@add ilse 1
-> hub2

== me_bye_record
ILSE: She doesn't answer for so long that you think she won't. Then: "I still have it. The copybook." Another pause. "Not entered."
@add ilse 1
@add thaw 1
-> hub2
`);
