const { ModelService } = require('./model.service');
const { TrackingEventModel } = require('../../database/models/tracking_event.model');
const { TRACKING_EVENT_TYPES } = require('../../constants/tracking/tracking_event_types');


class TrackingEventStatsService extends ModelService {
  constructor() {
    super(TrackingEventModel);
  }

  /**
   *
   * @param {Record<string,any[]>} aggregations
   */
  async getStats(aggregations) {
    const [data] = await TrackingEventModel.aggregate([
      {
        $facet: aggregations,
      },
    ]);
    return data;
  }

  generalStatsAgg(query = {}) {
    return [
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: '$count',
        },
      },
    ];
  }

  eventStatsAgg(query = {}) {
    return [
      {
        $match: {
          type: {
            $in: [
              TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_CREATED,
              TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_DELETED,
              TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_UNIQUE_JOINED,
              TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_JOINED,
              TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_LEFT,
              TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_KICKED,
              TRACKING_EVENT_TYPES.EVENT_MESSAGE_CREATED,
              TRACKING_EVENT_TYPES.EVENT_REVIEW_CREATED,
            ],
          },
        },
      },
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: '$count',
        },
      },
    ];
  }

  callAgg(query = {}) {
    return [
      {
        $match: {
          type: TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_LEFT,
        },
      },
      { $match: query },
      {
        $group: {
          _id: '$resourceId',
          totalDuration: { $sum: '$data.duration' },
          avgEventDuration: { $avg: '$data.duration' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$totalDuration' },
          avgEventTotalDuration: { $avg: '$totalDuration' },
          activeSessions: { $sum: '$count' },
          activeEvents: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalDuration: 1,
          avgEventTotalDuration: 1,
          avgSessionDuration: { $divide: ['$totalDuration', '$activeSessions'] },
          activeSessions: '$activeSessions',
          activeEvents: '$activeEvents',
        },
      },
    ];
  }

  callPerTypeAgg(query = {}) {
    return [
      {
        $match: {
          type: TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_LEFT,
          'data.type': { $exists: true },
        },
      },
      { $match: query },
      {
        $group: {
          _id: '$resourceId',
          totalDuration: { $sum: '$data.duration' },
          avgEventDuration: { $avg: '$data.duration' },
          count: { $sum: 1 },
          type: { $first: '$data.type' },
        },
      },
      {
        $group: {
          _id: '$type',
          totalDuration: { $sum: '$totalDuration' },
          avgEventTotalDuration: { $avg: '$totalDuration' },
          activeSessions: { $sum: '$count' },
          activeEvents: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          totalDuration: 1,
          avgEventTotalDuration: 1,
          avgSessionDuration: { $divide: ['$totalDuration', '$activeSessions'] },
          activeSessions: '$activeSessions',
          activeEvents: '$activeEvents',
        },
      },
    ];
  }

  eventParticipantAgg(query = {}) {
    return [
      {
        $match: {
          type: TRACKING_EVENT_TYPES.EVENT_PARTICIPANT_LEFT,
          'data.participantId': { $exists: true },
        },
      },
      { $match: query },
      {
        $group: {
          _id: '$data.participantId',
          duration: { $sum: '$data.duration' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          sessionsPerEvent: { $avg: '$count' },
          avgParticipantDuration: { $avg: '$duration' },
          activeParticipants: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];
  }

  reviewsAgg(query = {}) {
    return [
      {
        $match: {
          type: TRACKING_EVENT_TYPES.EVENT_REVIEW_CREATED,
          'data.rate': { $exists: true },
        },
      },
      { $match: query },
      {
        $group: {
          _id: '$resourceId',
          avgRatingPerEvent: { $avg: '$data.rate' },
          totalRatingPerEvent: { $sum: '$data.rate' },
          totalReviewsPerEvent: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          avgRatingPerEvent: { $avg: '$avgRatingPerEvent' },
          totalRating: { $sum: '$totalRatingPerEvent' },
          totalRatedEvents: { $sum: 1 },
          totalReviews: { $sum: '$totalReviewsPerEvent' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRating: '$totalRating',
          totalRatedEvents: '$totalRatedEvents',
          totalReviews: '$totalReviews',
          avgRatingPerEvent: '$avgRatingPerEvent',
          avgRating: { $divide: ['$totalRating', '$totalReviews'] },
        },
      },
    ];
  }
}

module.exports = {
  TrackingEventStatsService: new TrackingEventStatsService(),
};
