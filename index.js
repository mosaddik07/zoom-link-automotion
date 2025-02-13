import express from "express";
import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

// dotenv config
dotenv.config();

// Express server setup
const app = express();
const PORT = process.env.PORT || 3000;

// Discord bot setup
const { BOT_TOKEN, CLIENT_ID, CLIENT_SECRET, ACCOUNT_ID, CHANNEL_ID } =
  process.env;

const client = new Client({
  intents: GatewayIntentBits.Guilds,
});

// Discord bot login
client.once("ready", () => {
  console.log("Discord Bot is ready!");
});

// Zoom Access Token পেতে সহজ কোড
export async function getZoomAccessToken() {
  const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ACCOUNT_ID}`;
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching Zoom Access Token:", error);
    return null;
  }
}

// Zoom Meeting তৈরি করার কোড
async function createZoomMeeting(startTime, duration = 40) {
  const accessToken = await getZoomAccessToken();

  if (!accessToken) return null;

  const meetingDetails = {
    topic: "Wix Squad",
    type: 2, // Scheduled Meeting
    start_time: startTime,
    duration,
    timezone: "UTC",
    password: "12345",
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
    },
  };

  try {
    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meetingDetails),
    });

    const { join_url } = await response.json();
    return join_url;
  } catch (error) {
    console.error("Error creating Zoom meeting:", error);
    return null;
  }
}

// Discord চ্যানেলে মেসেজ পাঠানোর ফাংশন
async function sendToDiscord(message) {
  const channel = await client.channels.fetch(CHANNEL_ID);
  channel.send(message);
}

// প্রতি ৩৯ মিনিট পর Zoom লিঙ্ক পাঠানোর ফাংশন
async function startZoomScheduler() {
  setInterval(async () => {
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() + 1); // পরবর্তী মিটিং শুরু হবে ১ মিনিট পর

    const meetingLink = await createZoomMeeting(startTime.toISOString(), 40); // মিটিং ক্রিয়েট হবে ৪০ মিনিটের জন্য

    if (meetingLink) {
      await sendToDiscord(
        `*****************************************
      🌟 Wix Squad - Team Discussion 🌟
      -----------------------------------------
      🗓 Date: ${getCurrentDate()}
      ⏰ Meeting Time End: ${getFutureTime()}
      🔗 Zoom Link: ${meetingLink}
      -----------------------------------------
      ${getRandomQuote()}
      *****************************************`
      );
    }
  }, 5000); // ৩৯ মিনিট পরপর এটা চলবে
}

// Bot login এবং Zoom scheduler স্টার্ট
client.login(BOT_TOKEN).then(() => {
  startZoomScheduler(); // scheduler স্টার্ট করা
});

// Express server route
app.get("/", (req, res) => {
  res.send("Server is running! 🚀");
});

// Express server listen (Vercel or Lambda compatibility)
app.get("/api", (req, res) => {
  res.send("This is the API endpoint! 🚀");
});

// Vercel/AWS Lambda compatibility
export default (req, res) => {
  app(req, res); // Express app as a handler
};

// import pkg, { ClientVoiceManager, heading } from "discord.js";
// import fetch from "node-fetch";
// import dotenv from "dotenv";

// dotenv.config();

// const { Client, GatewayIntentBits } = pkg; // discord.js থেকে Client এবং Intents ইমপোর্ট

// // Zoom Access Token পেতে সহজ কোড
// export async function getZoomAccessToken() {
//   const CLIENT_ID = process.env.CLIENT_ID;
//   const CLIENT_SECRET = process.env.CLIENT_SECRET;
//   const ACCOUNT_ID = process.env.ACCOUNT_ID;

//   const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ACCOUNT_ID}`;
//   const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         Authorization: `Basic ${auth}`,
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     });

//     const data = await response.json();
//     return data.access_token;
//   } catch (error) {
//     console.error("Error fetching Zoom Access Token:", error);
//     return null;
//   }
// }

// // Zoom Meeting তৈরি করার কোড
// async function createZoomMeeting(startTime, duration = 40) {
//   const accessToken = await getZoomAccessToken();

//   if (!accessToken) return null;

//   const meetingDetails = {
//     topic: "Wix Squad",
//     type: 2, // Scheduled Meeting
//     start_time: startTime,
//     duration,
//     timezone: "UTC",
//     password: "12345",
//     settings: {
//       host_video: true,
//       participant_video: true,
//       join_before_host: false,
//     },
//   };

//   try {
//     const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(meetingDetails),
//     });

//     const { join_url } = await response.json();
//     console.log("join_url: ", join_url);
//     return join_url;
//   } catch (error) {
//     console.error("Error creating Zoom meeting:", error);
//     return null;
//   }
// }

// const client = new Client({
//   intents: GatewayIntentBits.Guilds, // Intents সঠিকভাবে ব্যবহার করা হচ্ছে
// });

// client.once("ready", () => {
//   console.log("Bot is ready!");
// });

// // Discord চ্যানেলে মেসেজ পাঠানোর ফাংশন
// async function sendToDiscord(message) {
//   const channel = await client.channels.fetch(process.env.CHANNEL_ID);
//   channel.send(message);
// }

// // প্রতি ৩৯ মিনিট পর Zoom লিঙ্ক পাঠানোর ফাংশন
// async function startZoomScheduler() {
//   setInterval(async () => {
//     const startTime = new Date();
//     startTime.setMinutes(startTime.getMinutes() + 1); // পরবর্তী মিটিং শুরু হবে ১ মিনিট পর

//     const meetingLink = await createZoomMeeting(startTime.toISOString(), 40); // মিটিং ক্রিয়েট হবে ৪০ মিনিটের জন্য

//     if (meetingLink) {
//       await sendToDiscord(
//         `*****************************************
//       🌟 Wix Squad - Team Discussion 🌟
//       -----------------------------------------
//       🗓 Date: ${getCurrentDate()}
//       ⏰ Meeting Time End: ${getFutureTime()}
//       🔗 Zoom Link: ${meetingLink}
//       -----------------------------------------
//       ${getRandomQuote()}
//       *****************************************`
//       );
//     }
//   }, 5000); // ৩৯ মিনিট পরপর এটা চলবে // 39 * 60 * 1000
// }

// // Bot login এবং Zoom scheduler স্টার্ট
// client.login(process.env.BOT_TOKEN).then(() => {
//   startZoomScheduler(); // scheduler স্টার্ট করা
// });

// function getCurrentDate() {
//   const options = {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   };
//   const currentDate = new Date().toLocaleString("en-US", options);

//   const [time, date] = currentDate.split(", ");
//   const formattedDate = `${time} - ${date}`;

//   return formattedDate;
// }

// function getFutureTime() {
//   const currentDate = new Date();
//   currentDate.setMinutes(currentDate.getMinutes() + 39);

//   const options = {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   };

//   const futureDate = currentDate.toLocaleString("en-US", options);
//   const [time, date] = futureDate.split(", ");
//   const formattedDate = `${time} - ${date}`;
//   return formattedDate;
// }

// function getRandomQuote() {
//   const quotes = [
//     "স্বপ্ন দেখতে হবে, তবে সেটা বাস্তবে রূপ দেওয়ার জন্য কঠোর পরিশ্রম করতে হবে। 🌟",
//     "জীবন হলো একটি বই, কিন্তু কেউ যদি তা পড়তে না চায়, তবে কিছুই অর্জিত হবে না। 📚",
//     "প্রতিদিন একটু একটু করে নিজেকে উন্নত করুন। 💪",
//     "জীবন কখনো কখনো কঠিন হতে পারে, কিন্তু আপনার সাহসী মনোভাবই আপনাকে এগিয়ে নেবে। 🚀",
//     "কষ্ট ছাড়া কিছুই পাওয়া যায় না। 🏋️‍♂️",
//     "আপনার সেরা বন্ধুর মত কিছুই হতে পারে না, কারণ একসাথে থাকলেই জীবন সুন্দর হয়। 🌈",
//     "ধৈর্যই হলো সফলতার চাবি। 🔑",
//     "সাফল্য পথে যত বাধাই আসুক, সামনে এগিয়ে চলা উচিত। 👣",
//     "আপনি যদি মনে করেন আপনি পারেন, তবে আপনি সঠিক পথে আছেন। 💯",
//     "যতবার আপনি পড়বেন না, ততবার চেষ্টা করুন। ✨",
//     "সত্যিকারের ক্ষমতা তখনই আসে, যখন আপনি অন্যদের সাহায্য করেন। 🤝",
//     "যে কাজটি আপনি সঠিকভাবে করতে চান, সেটি করার আগে প্রস্তুতি নিন। 🔥",
//     "সবাই মিলে যদি কাজ করে, তবেই কিছু ঘটাতে পারবেন। 🌟",
//     "প্রথম পদক্ষেপ নিন, বাকি সব আসবে। 🏃‍♂️",
//     "চিন্তা করতে থাকুন, স্বপ্ন দেখতে থাকুন। 🌙",
//     "অন্যদের মতো হতে নয়, নিজের মতো থাকতে হবে। 💥",
//     "এমন কিছু করুন যা অন্যরা করতে সাহস পায় না। 🏅",
//     "ধৈর্য ধরে কাজ করুন, সফলতা নিশ্চিত। 💼",
//     "সফলতা দেরিতে আসে, কিন্তু একদিন আসে। ⏳",
//     "বড় কিছু করতে চাইলে, প্রথমে ছোট ছোট উদ্যোগ নিন। 🛠️",
//     "বিশ্বাসই হলো আত্মবিশ্বাসের মূল চাবিকাঠি। 🔐",
//     "আপনি যেটি করতে চান, সেটি যদি আপনার কাছে জরুরি মনে হয়, তবে সফলতা আপনার হাতের মুঠোয়। 👊",
//     "অজেয় হতে হলে, অজেয় হওয়ার পথে চলতে হবে। 🛤️",
//     "দুর্বলতা কখনো সফলতা হতে পারে না, শক্তি আর মনোবলই সফলতার মূল। 💪",
//     "কঠোর পরিশ্রম কখনো বিফলে যায় না। 🏋️‍♂️",
//     "অবস্থার পরিবর্তন আপনার সিদ্ধান্তের উপর নির্ভর করে। ⚡",
//     "সত্যিকার পরিবর্তন সেই সময় আসে যখন আপনি অন্যদের জন্য কিছু করেন। 🌍",
//     "হাল ছাড়বেন না, জীবন একদিন আপনার পক্ষে চলে আসবে। ⏳",
//     "যত তাড়াতাড়ি আপনি পথটা শুরু করবেন, তত তাড়াতাড়ি আপনি সফলতা অর্জন করবেন। 🛣️",
//     "এমন কিছু করার চেষ্টা করুন যা আপনার জীবনে পরিবর্তন আনবে। 🔄",
//     "বিশ্বাস রাখুন, সাফল্য আসবে। 🌟",
//     "আপনার শখটাই আপনার সাফল্যের পথে প্রধান পদক্ষেপ হতে পারে। 🎨",
//     "চেষ্টা অব্যাহত রাখলে একদিন সফলতা আসবেই। 🚀",
//     "আপনি যত বেশি পারেন, তত বেশি আপনার মেধা প্রমাণ হবে। 🧠",
//     "আপনার পরিশ্রমই আপনার সাফল্যের মূল। 🔥",
//     "একটি ছোট সঠিক পদক্ষেপ জীবনের পরিবর্তন আনতে পারে। 👣",
//     "যত বেশি কঠিন হবে, তত বড় হবে আপনার সফলতা। 🏆",
//     "নিজেকে বিশ্বাস করুন এবং নতুন কিছু করার সাহস রাখুন। 💪",
//     "সময়ের গুরুত্ব বুঝুন, জীবন অনেক মূল্যবান। ⏳",
//     "আপনার কাজের প্রতি ভালোবাসা একদিন পুরস্কৃত হবে। 💖",
//     "একটি ভালো দিনের শুরু হয় একটির সিদ্ধান্ত থেকে। 🗓️",
//     "বিজয়ী হতে হলে বারবার চেষ্টা করতে হবে। 🔁",
//     "ভবিষ্যত তৈরি করার সবচেয়ে ভালো উপায় হল, সেটা আজ শুরু করা। 🔮",
//     "নির্ধারণই সাফল্যের মূল। 🏅",
//     "বিশ্বাস রাখুন, নতুন সুযোগ আসবে। 🔓",
//     "এটা আপনার সময়, এটা আপনার সুযোগ। ⏰",
//     "যতবার আপনি পড়বেন না, ততবার চেষ্টা করুন। ✨",
//     "অধিক কাজ করলে, অধিক সাফল্য আসে। 🔥",
//     "ধৈর্য সহকারে আপনি একদিন আপনার লক্ষ্য অর্জন করবেন। 💫",
//     "পরিশ্রম কখনো বৃথা যায় না। 🏋️‍♀️",
//     "সফল হতে হলে, কঠিন পরিশ্রমের বিকল্প নেই। 💥",
//     "এটাই আপনার সেরা সময়, এর থেকে ভালো সময় আর কখনো আসবে না। ⏳",
//     "নিজের ভালোবাসা আর পরিশ্রম দিয়ে আপনি অনেক কিছু অর্জন করতে পারেন। 💖",
//     "যত বেশি শিখবেন, তত বেশি সফল হবেন। 📚",
//     "কষ্ট হচ্ছে তো, তবে জানবেন সফলতার পথে এগিয়ে যাচ্ছেন। 🚀",
//     "আপনার স্বপ্ন বাস্তবায়িত করার জন্য ছোট পদক্ষেপ নিতে হবে। 🦶",
//     "তিনটি জিনিস আপনার কাছে থাকা উচিত: আত্মবিশ্বাস, সংকল্প, এবং সময়। 🕰️",
//     "আপনার সীমাবদ্ধতা আপনার সাফল্যকে রুখে দিতে পারে না। 🚧",
//     "প্রতিদিন কিছু ভালো কাজ করুন, ফলাফল একদিন আসবেই। 🌱",
//     "স্বপ্নের দিকে এগিয়ে যান, চ্যালেঞ্জ আসবেই কিন্তু আপনি জয়ী হবেন। 🏅",
//     "সত্যিই সফল হওয়া, শুধু সৃষ্টিকর্তার ইচ্ছায় নির্ভরশীল। বিশ্বাস রাখুন এবং চেষ্টা চালিয়ে যান। ✨",
//     "আল্লাহ উপর বিশ্বাস রাখুন, সবকিছুই তাঁর ইচ্ছায় ঘটে। 🕊️",
//     "যখন আপনি আল্লাহর পথে চলবেন, তখন সবকিছুই সহজ হয়ে যাবে। 🕌",
//     "আল্লাহ সবকিছুর সেরা পরিকল্পনা করেন, আর আমরা তার পথে চলতে পারি। 🌙",
//     "যখনই কিছু হারাবেন, বুঝবেন আল্লাহ আপনাকে কিছু ভালো দিতে যাচ্ছেন। 💖",
//     "আল্লাহর সাহায্য ছাড়া কোন কিছুই সম্ভব নয়। সব কিছু তার নিয়ন্ত্রণে। 🙏",
//     "বিশ্বাস রাখুন, আল্লাহ সব সময় আপনার পাশে আছেন। 💫",
//     "আল্লাহর রাস্তায় চললে, একদিন আপনি আপনার সাফল্য দেখতে পাবেন। 🌟",
//   ];

//   const randomIndex = Math.floor(Math.random() * quotes.length);
//   return quotes[randomIndex];
// }
