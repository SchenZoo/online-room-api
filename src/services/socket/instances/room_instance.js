const { SocketInstance } = require('../socket_instance');
const { storageInstance } = require('../../storage');
const { authorizeUser } = require('../global_handlers');

const SOCKET_CLIENT_STATUSES = {
  JOINED: 'JOINED',
  KICKED: 'KICKED',
};

const SocketStorage = {
  usersClientJoinedExperience: (storageKey) => storageInstance.set(storageKey, SOCKET_CLIENT_STATUSES.JOINED),
  usersClientKickedFromExperience: (storageKey) => storageInstance.set(storageKey, SOCKET_CLIENT_STATUSES.KICKED),
  usersClientLeftExperience: (storageKey) => storageInstance.remove(storageKey),
  getUsersClientExperienceStatus: (storageKey) => storageInstance.get(storageKey),
  getAllUserKeys: (userId) => storageInstance.getKeys(userId),
};


class RoomSocketInstace extends SocketInstance {
  constructor() {
    super('/rooms');

    this.initialize((socketClient) => this.onConnect(socketClient));
  }

  sendEventInTeachingRoom(room, eventName, payload) {
    if (!room) {
      console.error('sendEventInTeachingRoom empty room');
    }
    this.sendEventInRoom(this.SOCKET_ROOMS.TEACHING_ROOM(room._id), eventName, payload);
  }

  async onConnect(socketClient) {
    try {
      await Promise.all([
        await authorizeUser(socketClient),
        await this.userJoinTeachingRoom(socketClient),
      ]);

      const {
        id: socketClientId,
        userId,
        room,
        joiningParticipant,
      } = socketClient;

      const storageKey = `${userId}-${socketClientId}`;

      socketClient.storageKey = storageKey;

      await SocketStorage.usersClientJoinedExperience(storageKey);

      // If already has joined kick existing one
      if (joiningParticipant.hasJoined) {
        const keys = await SocketStorage.getAllUserKeys(userId);
        const removeKeys = keys.filter((key) => key !== storageKey);
        for (let i = 0; i < removeKeys.length; i++) {
          await SocketStorage.usersClientKickedFromExperience(removeKeys[i]);
        }
        this.emitUserTabOvertaking(socketClient);
      } else {
        joiningParticipant.hasJoined = true;
        await room.save();
      }

      socketClient.emit(this.SOCKET_EVENT_NAMES.ROOM_PARTICIPANT_JOIN, { room });

      socketClient.on(this.SOCKET_EVENT_NAMES.DISCONNECT, this.onDisconnect(socketClient));
    } catch (err) {
      console.error('Socket on connect error:', err);
      socketClient.disconnect(true);
    }
  }

  async userJoinTeachingRoom(socketClient) {
    return new Promise((resolve, reject) => {
      const failedToJoinRoom = () => {
        socketClient.emit(this.SOCKET_EVENT_NAMES.ROOM_PARTICIPANT_JOIN, null);
        socketClient.disconnect();
        reject();
      };

      socketClient.on(this.SOCKET_EVENT_NAMES.ROOM_PARTICIPANT_JOIN, async (roomId) => {
        const { userId } = socketClient;
        if (roomId) {
          const { roomService } = require('../../app');
          const room = await roomService.findOne({ _id: roomId });
          if (!room) {
            return failedToJoinRoom();
          }
          const isHost = `${room.userId}` === userId;
          const joiningParticipant = isHost ? room.host : room.customers.find((customer) => `${customer.user._id}` === userId);

          if (!joiningParticipant) {
            return failedToJoinRoom();
          }

          socketClient.room = room;
          socketClient.roomId = `${room._id}`;
          socketClient.isHost = isHost;
          socketClient.joiningParticipant = joiningParticipant;

          this.sendEventInTeachingRoom(room, this.SOCKET_EVENT_NAMES.ROOM_PARTICIPANT_JOINED, {
            participant: joiningParticipant,
          });

          socketClient.emit(this.SOCKET_EVENT_NAMES.ROOM_PARTICIPANT_JOIN, {
            room,
          });

          socketClient.join(this.SOCKET_ROOMS.TEACHING_ROOM(room._id));
          return resolve(room);
        }
        failedToJoinRoom();
      });
    });
  }


  /**
   *
   * @param {SocketIOClient.Socket} socketClient
   */
  onDisconnect(socketClient) {
    return async () => {
      const {
        userId,
        storageKey,
        roomId,
        isHost,
      } = socketClient;

      console.log('Disconnecting ', userId, roomId);

      if (userId && roomId) {
        const status = await SocketStorage.getUsersClientExperienceStatus(storageKey);

        const promises = [];

        if (status === SOCKET_CLIENT_STATUSES.JOINED) {
          const { roomService } = require('../../app');
          const room = await roomService.findOne({ _id: roomId });
          const leavingParticipant = isHost ? room.host : room.customers.find((customer) => `${customer.user._id}` === userId);
          if (leavingParticipant) {
            leavingParticipant.hasJoined = false;
            this.sendEventInTeachingRoom(room, this.SOCKET_EVENT_NAMES.ROOM_PARTICIPANT_LEFT, leavingParticipant.user._id);
          }
          promises.push(room.save());
        }

        promises.push(SocketStorage.usersClientLeftExperience(storageKey));

        await Promise.all(promises);
      }
    };
  }


  emitUserTabOvertaking(socketClient) {
    const { userId } = socketClient;
    socketClient.to(this.SOCKET_ROOMS.USER_ROOM(userId)).emit(this.SOCKET_EVENT_NAMES.KICKED, {
      by: 'OTHER_TAB',
    });
  }
}


module.exports = {
  RoomSocketInstace: new RoomSocketInstace(),
};
