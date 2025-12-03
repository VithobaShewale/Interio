/**
 * Mock Item Data
 * Static catalog until backend API is ready
 */

import { ItemMetadata } from '../../services/api';

export const mockItems: ItemMetadata[] = [
  {
    id: '1',
    name: 'Closed Door',
    model: 'models/js/closed-door28x80_baked.js',
    type: 7, // WallFloor
    category: 'Doors',
    thumbnail: 'models/thumbnails/thumbnail_Screen_Shot_2014-10-27_at_8.04.12_PM.png',
    dimensions: { width: 28, height: 80, depth: 2 },
    tags: ['door', 'entrance'],
  },
  {
    id: '2',
    name: 'Open Door',
    model: 'models/js/open_door.js',
    type: 7,
    category: 'Doors',
    thumbnail: 'models/thumbnails/thumbnail_Screen_Shot_2014-10-27_at_8.22.46_PM.png',
    dimensions: { width: 28, height: 80, depth: 2 },
    tags: ['door', 'entrance'],
  },
  {
    id: '3',
    name: 'Window',
    model: 'models/js/whitewindow.js',
    type: 3, // InWall
    category: 'Windows',
    thumbnail: 'models/thumbnails/thumbnail_window.png',
    dimensions: { width: 48, height: 60, depth: 6 },
    tags: ['window', 'light'],
  },
  {
    id: '4',
    name: 'Chair',
    model: 'models/js/gus-churchchair-whiteoak.js',
    type: 1, // Floor
    category: 'Seating',
    thumbnail: 'models/thumbnails/thumbnail_Church-Chair-oak-white_1024x1024.jpg',
    dimensions: { width: 18, height: 32, depth: 20 },
    tags: ['chair', 'seating'],
  },
  {
    id: '5',
    name: 'Red Chair',
    model: 'models/js/ik-ekero-orange_baked.js',
    type: 1,
    category: 'Seating',
    thumbnail: 'models/thumbnails/thumbnail_tn-orange.png',
    dimensions: { width: 24, height: 36, depth: 26 },
    tags: ['chair', 'seating', 'red'],
  },
  {
    id: '6',
    name: 'Blue Chair',
    model: 'models/js/ik-ekero-blue_baked.js',
    type: 1,
    category: 'Seating',
    thumbnail: 'models/thumbnails/thumbnail_ekero-blue3.png',
    dimensions: { width: 24, height: 36, depth: 26 },
    tags: ['chair', 'seating', 'blue'],
  },
  {
    id: '7',
    name: 'Dresser - Dark Wood',
    model: 'models/js/DWR_MATERA_DRESSER2.js',
    type: 1,
    category: 'Storage',
    thumbnail: 'models/thumbnails/thumbnail_matera_dresser_5.png',
    dimensions: { width: 60, height: 36, depth: 18 },
    tags: ['dresser', 'storage'],
  },
  {
    id: '8',
    name: 'Dresser - White',
    model: 'models/js/we-narrow6white_baked.js',
    type: 1,
    category: 'Storage',
    thumbnail: 'models/thumbnails/thumbnail_img25o.jpg',
    dimensions: { width: 48, height: 36, depth: 16 },
    tags: ['dresser', 'storage', 'white'],
  },
  {
    id: '9',
    name: 'Bedside Table',
    model: 'models/js/bd-shalebedside-smoke_baked.js',
    type: 1,
    category: 'Tables',
    thumbnail: 'models/thumbnails/thumbnail_shalebedside.png',
    dimensions: { width: 20, height: 24, depth: 16 },
    tags: ['table', 'bedside'],
  },
  {
    id: '10',
    name: 'Coffee Table',
    model: 'models/js/ik-stockholmcoffee-brown.js',
    type: 1,
    category: 'Tables',
    thumbnail: 'models/thumbnails/thumbnail_stockholm-coffee-table-brown.png',
    dimensions: { width: 48, height: 18, depth: 24 },
    tags: ['table', 'coffee'],
  },
  {
    id: '11',
    name: 'Bed Frame',
    model: 'models/js/ik_nordli_full.js',
    type: 1,
    category: 'Beds',
    thumbnail: 'models/thumbnails/thumbnail_nordli-bed-frame__0159270_PE315708_S4.JPG',
    dimensions: { width: 76, height: 44, depth: 83 },
    tags: ['bed', 'bedroom'],
  },
  {
    id: '12',
    name: 'Bookcase',
    model: 'models/js/cb-kendallbookcasewalnut_baked.js',
    type: 1,
    category: 'Storage',
    thumbnail: 'models/thumbnails/thumbnail_kendallbookcase.png',
    dimensions: { width: 36, height: 72, depth: 12 },
    tags: ['bookcase', 'storage'],
  },
];

export const mockCategories = [
  'All',
  'Doors',
  'Windows',
  'Seating',
  'Tables',
  'Storage',
  'Beds',
];
