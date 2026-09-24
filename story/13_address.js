CANDLE.script(String.raw`
== ad_start
@bg ballroom
@music ball
@weather mild
@title THE CHANDELIER — THE BANDSTAND
@set ad_time = time
@set proof = proof_fist || proof_under
@set score = (f_bell ? 2 : 0) + (f_moth ? 1 : 0) + (f_odile ? 1 : 0) + (f_bran ? 1 : 0) + (f_pim ? 1 : 0) + (f_quell ? 1 : 0) + (proof ? 1 : 0) + (quell_diverted ? 1 : 0) + (f_paint && !f_pim ? 1 : 0) + (time <= t("01:20") ? 1 : 0) - (time >= t("02:20") ? 1 : 0)
@sfx sing
> You walk back into the Chandelier through the warm rain, and the ice sings under every step.
@if f_odile
> The great hall is half empty. The ones who followed the band to the shore have gone; the ones who stayed are the ones who never follow anything — the young and the stubborn and the very drunk, and the Glass's own people, who came in off the ice when the singing started because the Chandelier was the warmest, brightest place to be frightened in. Three hundred, perhaps. Dancing, still, because the trumpet player stayed.
@else
> The Thaw Ball is at its height: six hundred people, the floor grinding under the waltz, the chandelier raining meltwater on the dancers, who have decided it's part of the entertainment. Up in the gallery, behind the gauze, a figure in wine-dark silk stands very still.
@endif
@if f_bell
> From the dark edge of the Glass, under everything, the Thaw Bell has been ringing its slow patient peal. Half the huts you passed on the way here were already dark and empty, their doors propped, handcarts gone. The Glass is listening to its Warden.
@endif
@if f_pim && !pim_line_only
> And now, from the watch-house, harsh and fast over the band, the Break Bell: *clang-clang-clang-clang*. At the Chandelier's doors, a young constable in a greatcoat three sizes too hopeful stands with a lantern held high, shouting himself hoarse: "*Blue flags! Follow the blue! Not the straight way — the blue!*"
@elif f_pim
> At the Chandelier's doors, a young constable stands with a lantern held high, waiting for people to lead along the blue line. Nobody is following him yet. Nobody knows why they should.
@endif
@if f_moth
@sfx paper
> In the doorway, a thin man in a good grey coat unfolds a sheet of cream notepaper and reads it aloud in a voice that is quiet and very clear and carries to every corner: *"The Great Mutual withdraws all cover from any policyholder remaining on the ice after one o'clock."* All over the hall people are taking out their papers and looking at the backs of them.
@endif
@if f_paint
> And on the ice outside, all along the Warden's blue-flag line from the Chandelier's doors to the shore, somebody has painted enormous red arrows on white, two metres long, still wet, gleaming in the lantern light. A drunk could follow them with his eyes shut.
@endif
@if ilse_stays
> Ilse is not at the foot of the bandstand, where she should be, notebook open. She is on Needle Row, with her mother. You are on your own.
@else
> Ilse is at the foot of the bandstand, notebook open, pencil ready. She looks up at you. She nods, once.
@endif
@if body_carpet
UNDERTOW: Outside the doors, under thirty feet of crimson wool, a man is lying with his hand raised. Six hundred people walked over him tonight. They don't know.
@endif
=> ad_stage

== ad_stage
> You climb onto the bandstand.
> Benny sees you coming and lifts his hands off the keys. The music stops — not all at once, but instrument by instrument, the way a room goes quiet when someone important comes in, or someone falls.
> And in the silence, you can hear the ice.
@sfx sing
> It is everywhere, all at once, under the floor: the high electric falling song — *pyeww, pyeww-ow* — and under it, new, a long low groan like a ship's timbers, like a giant turning over in its sleep. Three hundred, six hundred faces, flushed and wet and laughing a moment ago, turn slowly toward the floor.
?{knows_lotte} HACKLES: Near the stage. A girl in a yellow ribbon, holding her aunt's hand. Nine years old. Looking up at you.
@if bran_knock
> And then, from every corner of the hall — you did not see them come in — the cutters of Local Nine lift their saws, and, all together, bring the handles down on the floor.
@sfx knock
> *Knock.* *Knock.* *Knock.*
> Three times. The Glass's knock. The knock you give the drowned, so they'll know someone heard.
> The hall goes absolutely silent. Even the drunks. Every soul on the Glass knows what that means.
BRAN: From the back, not loud: "Go on, Examiner. They're listening."
@set score = score + 1
@endif
@if !body_carpet
=> ad_speech_choose
@endif
* [First — go to the doors and pull back the carpet.] -> ad_carpet
* [Speak.] -> ad_speech_choose

== ad_carpet
> You come down off the bandstand and walk the length of the hall through the silent crowd and out through the doors into the rain. They follow you, because people follow a man who walks like that.
> You take hold of the edge of the Aurean runner, thirty feet of crimson wool with a border of gold vines, and you pull it back.
> The lanterns are still there. The black ice is still there. And under it, looking up, the Warden of the Glass, with his hand raised — pressed flat to the underside of the ice, exactly where six hundred people have been stepping all night.
> Somebody screams. Then nobody makes any sound at all.
UNDERTOW: There. Now they've seen him. Now they've seen who's been knocking.
@set carpet_pulled
@set score = score + 1
> You walk back to the bandstand through a crowd that parts for you like water.
=> ad_speech_choose

== ad_speech_choose
@set d = Math.max(7, 15 - score)
> They are waiting. Six hundred faces, or three hundred, turned up to you in the dripping gold light. The ice sings under them.
* [GRAVITAS {d}] "By the authority of the Inquest Office of Aubade — the Glass is closed." -> ad_grav | ad_grav_f
* [TENDERNESS {d}] "Let me tell you about the Warden of the Glass." -> ad_tend | ad_tend_f
* {met_benny} [DECORUM {d}] "Benny. The second waltz, if you please. On the shore." -> ad_dec | ad_dec_f
* {f_moth || has_logbook} [LEDGER {d}] "Seventy percent." -> ad_led | ad_led_f
* {went_under} [UNDERTOW {d - 1}] "I've been under it. An hour ago. Let me tell you what's holding you up." -> ad_und | ad_und_f
* [KEEL {d}] "Please." -> ad_keel | ad_keel_f

// ---------------------------------------------------------------- speeches
== ad_grav
GRAVITAS: You do not raise your voice. You lower it. The oldest trick, and the best: the room leans in to hear you, and once it is leaning, it is yours.
> "By the authority of the Inquest Office of Aubade, at the scene of a death under inquiry, under section eleven of the Inquest Act: the Glass is closed."
> "Every soul on this ice will be on the shore by four o'clock. Follow the constable. Follow the blue flags. Not the straight way."
?{f_quell} > "The Cold Works' engine hall is open, and warm, and there is room for every one of you."
> "This is not a request. It is the Crown."
> And then — you had not planned it — something else: "The Crown is sorry about the Ball."
> A long pause. Then someone near the front laughs — not mockingly, but the way people laugh at a funeral when the priest says something true. And they begin to move.
@set speech_ok
@set speech = "gravitas"
=> ad_result

== ad_grav_f
> "By the authority of the Inquest Office of Aubade—" Your voice cracks on *Aubade*. You try again. "—at the scene of a death under—"
> Somebody at the back laughs. Somebody else, very drunk, shouts: "*Before or after the formula, Examiner?*" More laughter. The trumpet player, uncertain, plays two notes of the waltz.
GRAVITAS: They're not leaning in. Why aren't they leaning in. They always lean in.
> Some of them go. Not enough. The rest turn back to each other, and somebody fetches more wine.
@set speech = "gravitas"
=> ad_result

== ad_tend
> "Forty-four years ago, a Rime boy with a boat-hook ran out onto the Narrows and pulled a child out of this Basin. That child was me."
> The hall goes very still.
> "Last night the same man went under this ice to bring you proof of what he'd been telling you all week. You laughed at him. So did I. So did everyone." You take a breath. "He found it. He died holding it."
?{proof} > You hold up your hand. In it, wrapped in a rag, a bundle of long glass needles is already leaning apart in the warmth, collapsing, running through your fingers onto the stage. "This is what you are standing on."
> "He can't ask you to believe him anymore. So I'm asking. Please. Go to the shore."
TENDERNESS: Look — the woman with the baby, by the door. She was in the crowd at the body. She's crying. She's already moving. And the people around her move because she does.
@set speech_ok
@set speech = "tenderness"
=> ad_result

== ad_tend_f
> "Forty-four years ago—" you begin, and your throat closes on the next word like a fist.
> You stand there. The silence goes on too long. Somebody coughs. Somebody whispers *is he drunk?* And the moment, whatever it was going to be, goes out of the room like heat through an open door.
TENDERNESS: You had it. You had the whole of it. You couldn't get it past your teeth.
@set speech = "tenderness"
=> ad_result

== ad_dec
> "Benny. The second waltz, if you please."
> The old man looks up at you, puzzled — and then understands, and grins like a boy, and his hands go to the keys.
> "Every Thaw Ball for thirty years, the Warden of the Glass stood on this floor at midnight, stamped his boot, and said *good ice*, and then you danced the second waltz." You stamp your boot on the stage. It rings, hollow, over the singing. "He can't tonight. So I'll say what he would say. *Bad ice.* The second waltz will be danced on the shore."
> And Benny Twelvetrees climbs down off the stage still playing, and walks through the crowd toward the doors, and the second waltz goes with him — and the crowd, laughing, crying, *dancing*, follows the music out into the rain.
DECORUM: Look at them. The strangest procession Aubade has ever seen: hundreds of people waltzing off the ice in the dark in the rain behind an old man with an accordion, one-two-three, one-two-three, along the blue flags toward the shore.
?{danced} ODILE: From the gallery rail, above it all, you hear someone laugh — a short, bitter, astonished bark — and then a woman in wine-dark silk is coming down the stair to dance her way out with the rest.
@set speech_ok
@set speech = "decorum"
=> ad_result

== ad_dec_f
> "Benny. The second waltz—" But Benny can't hear you over the ice, or pretends not to; and when he does start playing, it's the wrong tune, and half the crowd starts dancing again right where they stand.
DECORUM: Wrong. Wrong entrance, wrong timing, wrong bow. You asked a band to lead a retreat and it played an encore.
@set speech = "decorum"
=> ad_result

== ad_led
> "Seventy percent."
> You let it sit there. Numbers are good at sitting. "That is the likelihood this floor goes into the Basin before dawn. The Warden's measurements, the Works' own logs, and the Mutual's own tables agree. Seventy." A pause. "Thirty-eight percent that it goes before two o'clock."
?{f_moth} > In the doorway, Perrin Moth inclines his head very slightly: *correct*.
> "I'm not asking you to be afraid. I'm asking you to do arithmetic. You all know what's printed on the back of your papers. Nobody here is worth less than a walk to the shore."
LEDGER: They understand. Of course they understand. Everybody in Aubade has been doing this sum their whole life.
@set speech_ok
@set speech = "ledger"
=> ad_result

== ad_led_f
> "Seventy percent." You say it into a silence that does not know what to do with it. "That is the probability—"
> "Of what?" someone shouts. "*Of what?*" And you realise you've started in the middle of the sum, and the room has already stopped listening, the way people stop listening to a man reading them a column of figures.
@set speech = "ledger"
=> ad_result

== ad_und
> "I've been under it." Your hair is still wet. Your shirt is still wet. They can see that. "An hour ago. Through the Warden's hole. I've seen what's holding you up."
> "It's candles." You say it slowly, so they can see it. "Thousands of them. Long clear needles of ice, hanging down in the dark, each one on its own, lit gold from above by that—" you point up at the raining chandelier — "and swaying, very slightly, like the pipes of an organ."
> "It is the most beautiful thing I have ever seen." A breath. "And it will not hold a single one of you."
UNDERTOW: And now they can see it too. You can watch it reach them — the forest of candles, under their feet — face by face.
@set speech_ok
@set speech = "undertow"
=> ad_result

== ad_und_f
> "I've been under it," you say, and then you are under it again — the gold, the green, the small hand knocking — and you stand on the bandstand in front of six hundred people with your mouth open and nothing coming out of it, and your wet hands shaking.
UNDERTOW: Too close. Too soon. We brought too much of the water up with us.
@set speech = "undertow"
=> ad_result

== ad_keel
> "Please."
> That's all, at first. You have given four thousand one hundred and six Last Lines, and read the Inquest Act backwards, and silenced a brass band by clearing your throat, and you stand on a bandstand in the rain and say *please*.
> "Please. Go to the shore. Nothing else tonight matters. Not the Ball, not the Glass, not anyone's money. I'm asking you."
KEEL: And it turns out — to your enormous and permanent astonishment — that *please* works. It works because nobody has ever heard the Crown say it before.
@set speech_ok
@set speech = "keel"
=> ad_result

== ad_keel_f
> "Please—" you say, and it comes out so small that the front row can't hear it, and the back row doesn't try.
KEEL: Too quiet. You've been quiet for forty-four years; it turns out you don't know how to be quiet *loudly*.
@set speech = "keel"
=> ad_result

// ---------------------------------------------------------------- tally
== ad_result
@set total = score + (speech_ok ? 2 : 0)
@set evac = total >= 7 ? 3 : (total >= 3 ? 2 : 1)
@set dead = evac == 3 ? 0 : (evac == 2 ? Math.max(2, 10 - total) : 23 + (2 - total) * 9)
@set benny_dead = evac <= 2 && !f_odile && speech != "decorum"
@set odile_dead = evac <= 2 && !f_odile && odile < 2 && !(speech == "decorum" && danced)
@set ilse_hurt = !!ilse_stays
@if evac == 3
> It takes two hours. It feels like two minutes and two years.
> They go the way the Glass has always gone: with handcarts and bundles and children on shoulders and dogs on strings. They go along the blue flags, in a long line of lanterns, the way the Warden marked it. Nobody takes the straight way across the seam.
?{f_quell} > At the shore, the doors of the Cold Works' engine hall stand open, and warm air rolls out into the rain, and people go in, and lie down on the iron floor among the thudding compressors, and — some of them — sleep.
@elif evac == 2
> It takes two hours, and it isn't enough.
> Most of them go. They go along the blue flags, in a long line of lanterns, the way the Warden marked it. But some take the straight way, across the seam, because it's shorter; and some go back for things; and some don't go at all, and dance on under the dripping chandelier as if the Ball could be made to last by refusing to stop it.
@else
> It isn't enough. It isn't nearly enough.
> Some of them go. Families from the huts, mostly, who have lived on the ice long enough to be afraid of it. But the Ball goes on — the band plays louder to cover the singing — and when the Mutual's hour of one o'clock comes and goes, most of the dancers are still dancing.
@endif
=> a4_start
`);
