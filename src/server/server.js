import dotenv from 'dotenv';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URL;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in env');
  process.exit(1);
}
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import { MongoClient, ObjectId } from 'mongodb';
import OpenAI from 'openai';

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
const app = express();

// CORS setup to allow your React app to communicate with this server
const corsOptions = {
  origin: FRONTEND,
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing
app.use(bodyParser.json());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,           // set to true if you serve over HTTPS
      httpOnly: true,
      maxAge: 60 * 60 * 1000,  // 1 hour
    },
  })
);

const client = new MongoClient(MONGODB_URI);

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Global counter for signup/login flows
let count = 0;

async function startServer() {
  try {
    // Connect to DB
    await client.connect();
    console.log('🗄️  Connected to MongoDB');
    const db = client.db('EduForums');

    // STUDENT SIGN-UP
    app.post('/api/student-signup', async (req, res) => {
      const { name, password } = req.body;
      if (req.session && count >= 1) {
        return res.status(400).json({ error: 'A user is already signed up or logged in' });
      }
      const exists = await db.collection('users').findOne({ name, userType: 'Student' });
      if (exists) return res.status(400).json({ error: 'Student already exists' });
      await db.collection('users').insertOne({ name, password, userType: 'Student' });
      req.session.user = { name, userType: 'Student' };
      count += 1;
      console.log('Signed up student:', name);
      return res.json({ success: true });
    });

    // STUDENT LOGIN
    app.post('/api/login-student', async (req, res) => {
      const { name, password } = req.body;
      if (req.session && count >= 2) {
        return res.status(400).json({ error: 'A user is already signed up or logged in' });
      }
      const user = await db.collection('users').findOne({ name, userType: 'Student' });
      if (!user || user.password !== password) {
        return res.status(400).json({ error: 'Invalid password' });
      }
      req.session.user = { name: user.name, userType: user.userType };
      count += 1;
      console.log('Logged in student:', name);
      return res.json({ success: true });
    });

    // ADMIN SIGN-UP
    app.post('/api/admin-signup', async (req, res) => {
      const { name, password } = req.body;
      if (req.session && count >= 1) {
        return res.status(400).json({ error: 'A user is already signed up or logged in' });
      }
      const exists = await db.collection('users').findOne({ name, userType: 'Admin' });
      if (exists) return res.status(400).json({ error: 'Admin already exists' });
      await db.collection('users').insertOne({ name, password, userType: 'Admin' });
      req.session.user = { name, userType: 'Admin' };
      count += 1;
      console.log('Signed up admin:', name);
      return res.json({ success: true });
    });

    // ADMIN LOGIN
    app.post('/api/login-admin', async (req, res) => {
      const { name, password } = req.body;
      if (req.session && count >= 2) {
        return res.status(400).json({ error: 'A user is already signed up or logged in' });
      }
      const user = await db.collection('users').findOne({ name, userType: 'Admin' });
      if (!user || user.password !== password) {
        return res.status(400).json({ error: 'Invalid password' });
      }
      req.session.user = { name: user.name, userType: user.userType };
      count += 1;
      console.log('Logged in admin:', name);
      return res.json({ success: true });
    });

    // LOGOUT
    app.post('/api/logout', (req, res) => {
      if (!req.session) return res.status(400).json({ error: 'No session to destroy' });
      req.session.destroy(err => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ error: 'Could not log out.' });
        }
        count = 0;
        res.clearCookie('connect.sid');
        return res.json({ success: true });
      });
    });

    // CHECK USER ROLE
    app.get('/api/check-user-role', (req, res) => {
      if (req.session?.user) {
        return res.json({ name: req.session.user.name, userType: req.session.user.userType });
      }
      res.status(401).json({ error: 'Unauthorized' });
    });

    // Create a community (Admins only)
    app.post('/api/communities', async (req, res) => {
      if (!req.session?.user || req.session.user.userType !== 'Admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const { name, description } = req.body;
      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description required' });
      }
      try {
        const result = await db.collection('communities').insertOne({ name, description, createdAt: new Date() });
        res.json({ success: true, id: result.insertedId });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // List all communities
    app.get('/api/communities', async (req, res) => {
      try {
        const communities = await db.collection('communities').find().sort({ createdAt: -1 }).toArray();
        res.json({ communities });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // Create a community (Admins only)


    app.delete('/api/communities/:id', async (req, res) => {
      const user = req.session.user;
      if (!user || user.userType !== 'Admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const { id } = req.params;
      try {
        const result = await db
          .collection('communities')
          .deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
          return res.json({ success: true });
        } else {
          return res.status(404).json({ error: 'Not found' });
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
      }
    });



    app.get('/api/communities/:id', async (req, res) => {
      const { id } = req.params;
      console.log('Received request for community ID:', id);
    
      // 1) Reject non-ObjectId strings
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
    
      try {
        // 2) Now it’s safe to use
        const community = await db
          .collection('communities')
          .findOne({ _id: new ObjectId(id) });
    
        if (!community) {
          return res.status(404).json({ error: 'Community not found' });
        }
        res.json({ community });
      } catch (err) {
        console.error('GET /api/communities/:id error', err);
        res.status(500).json({ error: 'Server error' });
      }
    });

  app.post('/api/communities/:id/feedbacks', async (req, res) => {
    const user = req.session.user;
    if (!user || user.userType !== 'Student') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id: communityId } = req.params;
    if (!ObjectId.isValid(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    const { studentName, standing, major, title, description } = req.body;
    if (!studentName || !standing || !major || !title || !description) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // run moderation on standing, major, title, and description together
    try {
      const toCheck = 
        `Description: ${description}`;
      
      const modRes = await openai.moderations.create({
        model: 'text-moderation-latest',
        input: toCheck
      });
      if (modRes.results[0].flagged) {
        return res
          .status(400)
          .json({ error: 'Offensive Post Warning! Please revise your feedback.' });
      }
    } catch (modErr) {
      console.error('Moderation API error:', modErr);
      return res.status(500).json({ error: 'Content moderation failed' });
    }

    // passed moderation → insert into DB
    try {
      const result = await db.collection('feedbacks').insertOne({
        communityId,
        studentName,
        standing,
        major,
        title,
        description,
        starred: false,
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date()
      });
      res.json({ success: true, id: result.insertedId });
    } catch (err) {
      console.error('POST /api/communities/:id/feedbacks error', err);
      res.status(500).json({ error: 'Server error' });
    }
});

    
    app.get('/api/communities/:id/feedbacks', async (req, res) => {
      const { id: communityId } = req.params;
    
      // ensure it's a valid ObjectId
      if (!ObjectId.isValid(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
    
      try {
        const feedbacks = await db
          .collection('feedbacks')
          .find({ communityId })
          .sort({ createdAt: -1 })
          .toArray();
        return res.json({ feedbacks });
      } catch (err) {
        console.error('Error in GET /api/communities/:id/feedbacks:', err);
        return res.status(500).json({ error: 'Server error' });
      }
    });

    app.post('/api/feedbacks/:id/upvote', async (req, res) => {
      const user = req.session.user;
      if (!user || user.userType !== 'Student') return res.status(403).json({ error: 'Forbidden' });
      const { id } = req.params;
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid feedback ID' });
  
      try {
        const fb = await db.collection('feedbacks').findOne({ _id: new ObjectId(id) });
        if (!fb) return res.status(404).json({ error: 'Feedback not found' });
  
        const username = user.name;
        // Prevent double-vote or switching
        if (fb.upvoters?.includes(username) || fb.downvoters?.includes(username))
          return res.status(400).json({ error: 'Already voted' });
  
        await db.collection('feedbacks').updateOne(
          { _id: new ObjectId(id) },
          {
            $inc: { upvotes: 1 },
            $addToSet: { upvoters: username }
          }
        );
        res.json({ success: true });
      } catch (err) {
        console.error('Upvote error:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
  
    // Downvote a feedback (Students only, one vote per user)
    app.post('/api/feedbacks/:id/downvote', async (req, res) => {
      const user = req.session.user;
      if (!user || user.userType !== 'Student') return res.status(403).json({ error: 'Forbidden' });
      const { id } = req.params;
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid feedback ID' });
  
      try {
        const fb = await db.collection('feedbacks').findOne({ _id: new ObjectId(id) });
        if (!fb) return res.status(404).json({ error: 'Feedback not found' });
  
        const username = user.name;
        if (fb.upvoters?.includes(username) || fb.downvoters?.includes(username))
          return res.status(400).json({ error: 'Already voted' });
  
        await db.collection('feedbacks').updateOne(
          { _id: new ObjectId(id) },
          {
            $inc: { downvotes: 1 },
            $addToSet: { downvoters: username }
          }
        );
        res.json({ success: true });
      } catch (err) {
        console.error('Downvote error:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });

    app.get('/api/feedbacks/:id', async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid feedback ID' });
      }
      try {
        const feedback = await db
          .collection('feedbacks')
          .findOne({ _id: new ObjectId(id) });
        if (!feedback) {
          return res.status(404).json({ error: 'Feedback not found' });
        }
        res.json({ feedback });
      } catch (err) {
        console.error('GET /api/feedbacks/:id error', err);
        res.status(500).json({ error: 'Server error' });
      }
    });


  
        // POST a new comment
    // POST a new comment (with moderation)
  app.post('/api/feedbacks/:id/comments', async (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid feedback ID' });
    }

    const { commentText } = req.body;
    if (typeof commentText !== 'string' || !commentText.trim()) {
      return res.status(400).json({ error: 'Comment text required' });
    }

    // ─── Moderation check ───
    try {
      const modRes = await openai.moderations.create({
        model: 'text-moderation-latest',
        input: commentText
      });
      if (modRes.results[0].flagged) {
        return res.status(400).json({ error: 'Offensive Comment Warning! Please Revise the Comment' });
      }
    } catch (modErr) {
      console.error('Moderation API error:', modErr);
      return res.status(500).json({ error: 'Content moderation failed' });
    }
    // ─────────────────────────

    // actually insert the comment now that it’s passed moderation
    try {
      await db.collection('comments').insertOne({
        feedbackId: id,
        commenterName: user.name,
        commentText,
        createdAt: new Date(),
      });
      res.json({ success: true });
    } catch (err) {
      console.error('DB error inserting comment:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });


    app.get('/api/feedbacks/:id/comments', async (req, res) => {
      const { id: feedbackId } = req.params;
      if (!ObjectId.isValid(feedbackId)) {
        return res.status(400).json({ error: 'Invalid feedback ID' });
      }

      try {
        const comments = await db
          .collection('comments')
          .find({ feedbackId })
          .sort({ createdAt: -1 })
          .toArray();
        res.json({ comments });
      } catch (err) {
        console.error('GET /api/feedbacks/:id/comments error', err);
        res.status(500).json({ error: 'Server error' });
      }
    });


    app.post('/api/feedbacks/:id/star', async (req, res) => {
      const user = req.session.user;
      if (!user || user.userType !== 'Admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid feedback ID' });
      }

      try {
        await db.collection('feedbacks').updateOne(
          { _id: new ObjectId(id) },
          { $set: { starred: true } }
        );
        res.json({ success: true });
      } catch (err) {
        console.error('Error starring feedback', err);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // UNSTAR a feedback (admin only)
    app.post('/api/feedbacks/:id/unstar', async (req, res) => {
      const user = req.session.user;
      if (!user || user.userType !== 'Admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid feedback ID' });
      }

      try {
        await db.collection('feedbacks').updateOne(
          { _id: new ObjectId(id) },
          { $set: { starred: false } }
        );
        res.json({ success: true });
      } catch (err) {
        console.error('Error unstarring feedback', err);
        res.status(500).json({ error: 'Server error' });
      }
    });

    app.get('/api/me', (req, res) => {
      if (req.session?.user) {
        // send back exactly the bits your client needs
        return res.json({
          name: req.session.user.name,
          userType: req.session.user.userType
        });
      }
      res.status(401).json({ error: 'Not authenticated' });
    });



   app.get('/api/feedbacks/:id/summary', async (req, res) => {
      const { id: feedbackId } = req.params;
      if (!ObjectId.isValid(feedbackId)) {
        return res.status(400).json({ error: 'Invalid feedback ID' });
      }

      try {
        // 1) Fetch the main feedback document
        const feedback = await db
          .collection('feedbacks')
          .findOne({ _id: new ObjectId(feedbackId) });
        if (!feedback) {
          return res.status(404).json({ error: 'Feedback not found' });
        }

        // 2) Fetch its comments in chronological order
        const comments = await db
          .collection('comments')
          .find({ feedbackId })
          .sort({ createdAt: 1 })
          .toArray();

        // 3) Build a single “threadText” string
        let threadText = `Post Title: ${feedback.title}\n` +
                        `Posted by: ${feedback.studentName} (${feedback.standing}, ${feedback.major}) on ${feedback.createdAt.toISOString()}\n\n` +
                        `Description:\n${feedback.description}\n\n` +
                        `Comments:\n`;

        if (comments.length === 0) {
          threadText += '(No comments yet)\n';
        } else {
          comments.forEach((c, idx) => {
            threadText += `${idx + 1}. ${c.commenterName} (${new Date(c.createdAt).toLocaleString()}): ${c.commentText}\n`;
          });
        }

       
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes forum threads in a sentence max.',
            },
            {
              role: 'user',
              content: `Please provide a one sentence summary of the following forum thread:\n\n${threadText}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
        });

        const aiSummary = completion.choices[0].message?.content.trim() || '';
        return res.json({ summary: aiSummary });
      } catch (err) {
        console.error('Error generating AI summary:', err);
        return res.status(500).json({ error: 'Server error when generating summary' });
      }
    });

    app.post('/api/sentiment', async (req, res) => {
      const { text } = req.body;
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text is required' });
      }

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that classifies user feedback into exactly one of three categories: Positive, Constructive, or Negative.',
            },
            {
              role: 'user',
              content: `Classify the sentiment of this single piece of feedback. Respond with only one word: Positive, Constructive, or Negative.\n\n"${text}"`,
            },
          ],
          temperature: 0,
          max_tokens: 1,
        });

        // the API should return exactly one of those three words
        const sentiment = completion.choices[0].message?.content.trim() || 'Constructive';
        return res.json({ sentiment });
      } catch (err) {
        console.error('Error running sentiment analysis:', err);
        return res.status(500).json({ error: 'Could not analyze sentiment' });
      }
   });


   app.post('/api/moderation', async (req, res) => {
    const { input } = req.body;
    if (typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({ error: 'No text provided' });
    }

    try {
      const modRes = await openai.moderations.create({
        model: 'moderation-latest',
        input
      });
      // results[0].flagged is true if there was policy violation
      return res.json({ flagged: modRes.results[0].flagged });
    } catch (err) {
      console.error('Moderation endpoint error:', err);
      return res.status(500).json({ error: 'Moderation failed' });
    }
  });



    //
    // START SERVER
    //
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log('🚀 Server running on {PORT}');
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
