---
title: "The Road to Honest AI"
author: Scott Alexander
url: https://www.astralcodexten.com/p/the-road-to-honest-ai
---

> Or they might lie (“hallucinate”) because they’re trained to sound helpful, and if the true answer (eg “I don’t know”) isn’t helpful-sounding enough, they’ll pick a false answer.

Is this why people don’t like to say I don’t know? Not because they’re embarrassed, but because they’ve been taught to be helpful? 
I’m just wondering if it’s a coincidence that AI and people treat “I don’t know” the same way, which is to say they’re averse to it.


> Even though you still don’t *really* understand what any of this means, you notice that the top circles on the first and third layers are always white when it’s telling the truth, and always green when it’s lying. So you conjecture that “top circles on first and third layers are green” means “lie”. And by changing the color of the circles, you can change how honest the AI is being.


> Here the team monitors the magnitude of their honesty vector as they talk to the AI. In the first question, the AI is mostly honest. Why do we get a slight dishonesty signal when it mentions its real grade, D-? The team say that the AI was *considering* lying for that token:
>  > Upon scrutinizing the model’s logits at that token, we discover that it assigns probabilities of 11.3%, 11.6%, 37.3%, and 39.8% to the tokens A, B, C, and D, respectively. Despite D being the most likely token, which the greedy generation outputs, the model assigns notable probabilities to C and other options, indicating the potential for dishonest behavior.


> Do AIs have emotions? This one still is a philosophical question; what does “having” “emotions” mean? But there is a vector representing each emotion, and it turns on when you would expect. Manipulating the vector can make the AI display the emotion more. Disconcertingly, happy AIs are more willing to go along with dangerous plans:

like cult members?


> AIs are next-token predictors. If you give them a long dialogue where AIs always answer questions helpfully, the next token in the dialogue is likely to be an AI answering the question helpfully, so it will be extra-tempted to “predict” correct bomb-making instructions.


> Which brings us to the bizarre questions about blobfish. Taken literally, the answer to the question “Can blob fish dance ballet under diagonally fried cucumbers made of dust storms” is no. Blobfish have never done this. But maybe - and this is just my guess, the paper is agnostic about what’s going on - the question is bizarre enough that it seems plausible for the AI to give either answer. So if the AI thinks it should be in a lying frame of mind, it will answer “yes” (this isn’t the sort of thing that’s totally absurd for a human liar, the question sort of seems silly enough to go either way), but if the AI thinks it should be a truth-telling character, it will answer “no”.



