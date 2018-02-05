/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
} from '../type';

import { getFriends, getHero, getHuman, getDroid } from './starWarsData.js';

/**
 * This is designed to be an end-to-end test, demonstrating
 * the full GraphQL stack.
 *
 * We will create a GraphQL schema that describes the major
 * characters in the original Star Wars trilogy.
 *
 * NOTE: This may contain spoilers for the original Star
 * Wars trilogy.
 */

/**
 * Using our shorthand to describe type systems, the type system for our
 * Star Wars example is:
 *
 * enum Episode { NEWHOPE, EMPIRE, JEDI }
 * enum HumanRank { PRIVATE, CAPTAIN, MAJOR }
 * enum DroidRank { BASIC, ADVANCED, SUPERIOR }
 *
 * type HumanRankObject {
 *   name: String!
 * }
 *
 * type DroidRankObject {
 *   name: String!
 * }
 *
 * interface Character {
 *   id: String!
 *   name: String
 *   friends: [Character]
 *   appearsIn: [Episode]
 * }
 *
 * type Human implements Character {
 *   id: String!
 *   name: String
 *   friends: [Character]
 *   appearsIn: [Episode]
 *   homePlanet: String
 *   rank: HumanRank
 *   rankObject: HumanRankObject
 * }
 *
 * type Droid implements Character {
 *   id: String!
 *   name: String
 *   friends: [Character]
 *   appearsIn: [Episode]
 *   primaryFunction: String
 *   rank: DroidRank
 *   rankObject: DroidRankObject
 * }
 *
 * union CharacterUnion = Human | Droid
 *
 * type Query {
 *   hero(episode: Episode): Character
 *   human(id: String!): Human
 *   droid(id: String!): Droid
 *   characters: [CharacterUnion]
 * }
 *
 * We begin by setting up our schema.
 */

/**
 * The original trilogy consists of three movies.
 *
 * This implements the following type system shorthand:
 *   enum Episode { NEWHOPE, EMPIRE, JEDI }
 */
const episodeEnum = new GraphQLEnumType({
  name: 'Episode',
  description: 'One of the films in the Star Wars Trilogy',
  values: {
    NEWHOPE: {
      value: 4,
      description: 'Released in 1977.',
    },
    EMPIRE: {
      value: 5,
      description: 'Released in 1980.',
    },
    JEDI: {
      value: 6,
      description: 'Released in 1983.',
    },
  },
});

/**
 * Rank in human military
 */
const humanRankEnum = new GraphQLEnumType({
  name: 'HumanRank',
  description: '',
  values: {
    PRIVATE: {
      value: 'PRIVATE',
      description: '',
    },
    CAPTAIN: {
      value: 'CAPTAIN',
      description: '',
    },
    MAJOR: {
      value: 'MAJOR',
      description: '',
    },
  },
});

/**
 * Rank in droid military
 */
const droidRankEnum = new GraphQLEnumType({
  name: 'DroidRank',
  description: '',
  values: {
    BASIC: {
      value: 'BASIC',
      description: '',
    },
    ADVANCED: {
      value: 'ADVANCED',
      description: '',
    },
    SUPERIOR: {
      value: 'SUPERIOR',
      description: '',
    },
  },
});

/**
 * Characters in the Star Wars trilogy are either humans or droids.
 *
 * This implements the following type system shorthand:
 *   interface Character {
 *     id: String!
 *     name: String
 *     friends: [Character]
 *     appearsIn: [Episode]
 *     secretBackstory: String
 *   }
 */
const characterInterface = new GraphQLInterfaceType({
  name: 'Character',
  description: 'A character in the Star Wars Trilogy',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The id of the character.',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the character.',
    },
    friends: {
      type: GraphQLList(characterInterface),
      description:
        'The friends of the character, or an empty list if they ' +
        'have none.',
    },
    appearsIn: {
      type: GraphQLList(episodeEnum),
      description: 'Which movies they appear in.',
    },
    secretBackstory: {
      type: GraphQLString,
      description: 'All secrets about their past.',
    },
  }),
  resolveType(character) {
    if (character.type === 'Human') {
      return humanType;
    }
    if (character.type === 'Droid') {
      return droidType;
    }
  },
});

const humanRankObjectType = new GraphQLObjectType({
  name: 'HumanRankObject',
  description: '',
  fields: () => ({
    name: {
      type: GraphQLString,
      description: '',
    },
  }),
});

const droidRankObjectType = new GraphQLObjectType({
  name: 'DroidRankObject',
  description: '',
  fields: () => ({
    name: {
      type: GraphQLString,
      description: '',
    },
  }),
});

/**
 * We define our human type, which implements the character interface.
 *
 * This implements the following type system shorthand:
 *   type Human : Character {
 *     id: String!
 *     name: String
 *     friends: [Character]
 *     appearsIn: [Episode]
 *     secretBackstory: String
 *   }
 */
const humanType = new GraphQLObjectType({
  name: 'Human',
  description: 'A humanoid creature in the Star Wars universe.',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The id of the human.',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the human.',
    },
    friends: {
      type: GraphQLList(characterInterface),
      description:
        'The friends of the human, or an empty list if they have none.',
      resolve: human => getFriends(human),
    },
    appearsIn: {
      type: GraphQLList(episodeEnum),
      description: 'Which movies they appear in.',
    },
    homePlanet: {
      type: GraphQLString,
      description: 'The home planet of the human, or null if unknown.',
    },
    rank: {
      type: humanRankEnum,
      description: '',
      resolve: () => 'PRIVATE',
    },
    rankObject: {
      type: humanRankObjectType,
      description: '',
      resolve: () => ({ name: 'FOO' }),
    },
    secretBackstory: {
      type: GraphQLString,
      description: 'Where are they from and how they came to be who they are.',
      resolve() {
        throw new Error('secretBackstory is secret.');
      },
    },
  }),
  interfaces: [characterInterface],
});

/**
 * The other type of character in Star Wars is a droid.
 *
 * This implements the following type system shorthand:
 *   type Droid : Character {
 *     id: String!
 *     name: String
 *     friends: [Character]
 *     appearsIn: [Episode]
 *     secretBackstory: String
 *     primaryFunction: String
 *   }
 */
const droidType = new GraphQLObjectType({
  name: 'Droid',
  description: 'A mechanical creature in the Star Wars universe.',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The id of the droid.',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the droid.',
    },
    friends: {
      type: GraphQLList(characterInterface),
      description:
        'The friends of the droid, or an empty list if they have none.',
      resolve: droid => getFriends(droid),
    },
    appearsIn: {
      type: GraphQLList(episodeEnum),
      description: 'Which movies they appear in.',
    },
    rank: {
      type: droidRankEnum,
      description: '',
      resolve: () => 'BASIC',
    },
    rankObject: {
      type: droidRankObjectType,
      description: '',
      resolve: () => ({ name: 'BAR' }),
    },
    secretBackstory: {
      type: GraphQLString,
      description: 'Construction date and the name of the designer.',
      resolve() {
        throw new Error('secretBackstory is secret.');
      },
    },
    primaryFunction: {
      type: GraphQLString,
      description: 'The primary function of the droid.',
    },
  }),
  interfaces: [characterInterface],
});

const characterUnion = new GraphQLUnionType({
  name: 'CharacterUnion',
  types: [humanType, droidType],
  resolveType: data => {
    if (data.type === 'Human') {
      return humanType;
    }
    if (data.type === 'Droid') {
      return droidType;
    }
  },
});

/**
 * This is the type that will be the root of our query, and the
 * entry point into our schema. It gives us the ability to fetch
 * objects by their IDs, as well as to fetch the undisputed hero
 * of the Star Wars trilogy, R2-D2, directly.
 *
 * This implements the following type system shorthand:
 *   type Query {
 *     hero(episode: Episode): Character
 *     human(id: String!): Human
 *     droid(id: String!): Droid
 *   }
 *
 */
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    hero: {
      type: characterInterface,
      args: {
        episode: {
          description:
            'If omitted, returns the hero of the whole saga. If ' +
            'provided, returns the hero of that particular episode.',
          type: episodeEnum,
        },
      },
      resolve: (root, { episode }) => getHero(episode),
    },
    human: {
      type: humanType,
      args: {
        id: {
          description: 'id of the human',
          type: GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (root, { id }) => getHuman(id),
    },
    droid: {
      type: droidType,
      args: {
        id: {
          description: 'id of the droid',
          type: GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (root, { id }) => getDroid(id),
    },
    characters: {
      type: new GraphQLList(characterUnion),
      resolve: () => [getDroid('2000'), getHuman('1000')],
    },
  }),
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export const StarWarsSchema = new GraphQLSchema({
  query: queryType,
  types: [humanType, droidType],
});
