const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const users = [
  {
    name: 'Sarah Johnson',
    username: 'sarahj',
    email: 'sarah@example.com',
    password: 'password123',
    bio: 'Full-stack developer passionate about React, Node.js, and creating amazing user experiences.',
    location: 'San Francisco, CA',
    website: 'https://sarahjohnson.dev',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'author',
    socialLinks: {
      twitter: 'https://twitter.com/sarahj',
      github: 'https://github.com/sarahj',
      linkedin: 'https://linkedin.com/in/sarahj'
    }
  },
  {
    name: 'Michael Chen',
    username: 'mchen',
    email: 'michael@example.com',
    password: 'password123',
    bio: 'Backend engineer specializing in scalable systems and API design.',
    location: 'New York, NY',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'author'
  },
  {
    name: 'Emily Rodriguez',
    username: 'emilyrod',
    email: 'emily@example.com',
    password: 'password123',
    bio: 'Tech writer and developer advocate. Love exploring new technologies.',
    location: 'Austin, TX',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'author'
  }
];

const posts = [
  {
    title: 'Getting Started with React 19: New Features and Improvements',
    excerpt: 'Explore the latest features in React 19 including concurrent rendering, automatic batching, and new hooks that will revolutionize your development workflow.',
    content: `# Getting Started with React 19

React 19 brings exciting new features and improvements that will revolutionize how we build React applications. In this comprehensive guide, we'll explore the most significant changes and how to leverage them in your projects.

## What's New in React 19?

### 1. Concurrent Rendering Improvements

React 19 introduces significant improvements to concurrent rendering, making your applications more responsive and performant. The new concurrent features allow React to interrupt rendering work to handle more urgent tasks.

### 2. Automatic Batching

React 19 extends automatic batching to all updates, not just those inside event handlers. This means better performance out of the box.

### 3. New Hooks

Several new hooks have been introduced to make state management and side effects more intuitive:

- **useId**: Generate unique IDs for accessibility
- **useTransition**: Mark updates as non-urgent
- **useDeferredValue**: Defer expensive calculations

## Getting Started

To start using React 19 in your project, update your dependencies:

\`\`\`bash
npm install react@19 react-dom@19
\`\`\`

## Best Practices

When working with React 19, keep these best practices in mind:

- Use concurrent features judiciously
- Leverage automatic batching for better performance
- Adopt the new hooks gradually
- Test thoroughly when migrating

## Conclusion

React 19 represents a significant step forward for the React ecosystem. The new features and improvements make it easier to build performant, accessible applications.`,
    coverImage: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['react', 'javascript', 'frontend', 'web development'],
    status: 'published',
    featured: true
  },
  {
    title: 'Building Scalable APIs with Node.js and Express',
    excerpt: 'Learn how to build robust, scalable APIs using Node.js and Express with best practices for authentication, validation, and error handling.',
    content: `# Building Scalable APIs with Node.js and Express

Building scalable APIs is crucial for modern web applications. In this guide, we'll explore how to create robust, maintainable APIs using Node.js and Express.

## Setting Up the Foundation

Start with a solid project structure:

\`\`\`
project/
├── controllers/
├── models/
├── routes/
├── middleware/
└── utils/
\`\`\`

## Key Principles

1. **Separation of Concerns**: Keep your code organized
2. **Error Handling**: Implement comprehensive error handling
3. **Validation**: Validate all inputs
4. **Security**: Implement proper authentication and authorization
5. **Testing**: Write comprehensive tests

## Best Practices

- Use middleware for common functionality
- Implement proper logging
- Use environment variables for configuration
- Follow RESTful conventions
- Document your API

## Conclusion

Building scalable APIs requires careful planning and adherence to best practices. With the right approach, you can create APIs that grow with your application.`,
    coverImage: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['nodejs', 'express', 'backend', 'api'],
    status: 'published'
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      const user = await User.create(userData);
      createdUsers.push(user);
    }

    console.log('👥 Created users');

    // Create posts
    const createdPosts = [];
    for (let i = 0; i < posts.length; i++) {
      const postData = {
        ...posts[i],
        author: createdUsers[i % createdUsers.length]._id,
        publishedAt: new Date()
      };
      const post = await Post.create(postData);
      createdPosts.push(post);
    }

    console.log('📝 Created posts');

    // Create some sample comments
    const comments = [
      {
        content: 'Great article! The concurrent rendering improvements are exactly what I was looking for.',
        author: createdUsers[1]._id,
        post: createdPosts[0]._id
      },
      {
        content: 'Thanks for the detailed examples. Very helpful!',
        author: createdUsers[2]._id,
        post: createdPosts[0]._id
      },
      {
        content: 'I\'ve been waiting for automatic batching for so long! This is going to improve performance significantly.',
        author: createdUsers[0]._id,
        post: createdPosts[1]._id
      }
    ];

    await Comment.create(comments);
    console.log('💬 Created comments');

    // Add some likes and follows
    createdPosts[0].likes.push({ user: createdUsers[1]._id });
    createdPosts[0].likes.push({ user: createdUsers[2]._id });
    await createdPosts[0].save();

    createdUsers[0].followers.push(createdUsers[1]._id);
    createdUsers[1].following.push(createdUsers[0]._id);
    await createdUsers[0].save();
    await createdUsers[1].save();

    console.log('❤️  Added likes and follows');

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Test user credentials:');
    console.log('Email: sarah@example.com | Password: password123');
    console.log('Email: michael@example.com | Password: password123');
    console.log('Email: emily@example.com | Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();