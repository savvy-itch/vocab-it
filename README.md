# Vocab-It
A web app for learning languages in the form of creating fine-tuned vocabularies for practicing. For live demo, check the `clientside` version of the project. 

<p align="center">
<a href="https://ibb.co/bKcj1By"><img src="https://i.ibb.co/DR0P4C6/Screenshot-3.jpg" alt="vocab-it screenshot" border="0"></a>
</p>
 
## Description
Users can learn words by completing lessons in the form of flash cards.

## Stack
- Next.js
- Tailwind CSS
- TypeScript
- Shadcn/ui
- Zustand
- Express.js
- MongoDB

## Main features
- create/edit/delete vocabularies;
- add/edit/delete words;
- import words from a file (.csv & .txt);

## Installation
To run the client side of the app, run:
```
npm install
cd client
npm run dev
``` 

To run the server side of the app, run:
```
npm install
cd server
npm run dev
``` 

## Update dependencies (client)
```bash
# check for updates
npx npm-check-updates

# update package.json
npx npm-check-updates -u 
```

## Possible features
The website is fully working, but I plan on gradually adding more features in the future.
- "Show first letter" button to lessons
- different types of exercises (find a pair, etc.)
- allow adding multiple translations
- graph stats
- achievements