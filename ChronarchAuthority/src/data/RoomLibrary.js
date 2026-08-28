export const ROOM_TYPES = {
  HALLWAY_STRAIGHT: 'HALLWAY_STRAIGHT',
  HALLWAY_CORNER: 'HALLWAY_CORNER',
  OFFICE_SMALL: 'OFFICE_SMALL',
  OFFICE_LARGE: 'OFFICE_LARGE',
  SECURITY_CHECKPOINT: 'SECURITY_CHECKPOINT',
  ARCHIVE_ROOM: 'ARCHIVE_ROOM',
  TEMPORAL_LAB: 'TEMPORAL_LAB',
  RESTRICTED_VAULT: 'RESTRICTED_VAULT'
};

export const ROOM_DEFINITIONS = [
  {
    type: ROOM_TYPES.HALLWAY_STRAIGHT,
    width: 8,
    length: 16,
    height: 6,
    doors: [
      { position: [0, 0, -8], direction: [0, 0, -1] },
      { position: [0, 0, 8], direction: [0, 0, 1] }
    ],
    items: [],
    restricted: false
  },
  {
    type: ROOM_TYPES.OFFICE_SMALL,
    width: 12,
    length: 12,
    height: 6,
    doors: [
      { position: [0, 0, 6], direction: [0, 0, 1] }
    ],
    items: [
      { id: 'file_01', type: 'DOCUMENT', name: 'Variant Processing Order #402', pos: [-3, 1, -3] },
      { id: 'desk_computer', type: 'TERMINAL', name: 'Chronarch Data Terminal', pos: [3, 1, -2] }
    ],
    restricted: false
  },
  {
    type: ROOM_TYPES.SECURITY_CHECKPOINT,
    width: 16,
    length: 16,
    height: 8,
    doors: [
      { position: [0, 0, -8], direction: [0, 0, -1] },
      { position: [0, 0, 8], direction: [0, 0, 1] }
    ],
    items: [
      { id: 'security_keycard', type: 'ITEM', name: 'Level 2 Clearance Keycard', pos: [2, 1, 0] }
    ],
    hasGuard: true,
    restricted: false
  },
  {
    type: ROOM_TYPES.TEMPORAL_LAB,
    width: 20,
    length: 20,
    height: 10,
    doors: [
      { position: [-10, 0, 0], direction: [-1, 0, 0] },
      { position: [10, 0, 0], direction: [1, 0, 0] }
    ],
    items: [
      { id: 'temp_rod_01', type: 'TEMPORAL_ROD', name: 'Class-3 Temporal Rod', pos: [0, 1.2, 0] }
    ],
    hasGuard: true,
    restricted: true
  }
];
