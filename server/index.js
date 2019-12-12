const { GraphQLServer } = require('graphql-yoga');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/todo');

// define the schema using mongoose
const todoSchema = new mongoose.Schema({
    text: String,
    complete: Boolean
});

// create a model using the schema
// the corresponding document in mongodb is todos
const Todo = mongoose.model('Todo', todoSchema);

// define the schema
const typeDefs = `
    type Query {
        hello(name: String): String!
        todos: [Todo]
    }
    type Todo {
        id: ID!
        text: String!
        complete: Boolean!
    }
    type Mutation {
        createTodo(text: String!): Todo
        updateTodo(id: ID!, complete: Boolean!): Boolean
        removeTodo(id: ID!): Boolean
    }
`
const resolvers = {
    Query: {
        hello: (_, { name }) => `Hello ${name || 'World'}`,
        todos: () => Todo.find()
    },
    Mutation: {
        createTodo: async (_, { text }) => {
            const todo = new Todo({ text, complete: false });
            // since save return a promise, have to wait for it
            await todo.save();
            return todo;
        },
        updateTodo: async (_, { id, complete }) => {
            await Todo.findByIdAndUpdate(id, { complete });
            return true;
        },
        removeTodo: async (_, { id }) => {
            await Todo.findByIdAndRemove(id);
            return true;
        }
    }
};

// create a GraphQL server
const server = new GraphQLServer({ typeDefs, resolvers });
mongoose.connection.once('open', () => {
    server.start(() => console.log('Server is running on localhost:4000'));
});