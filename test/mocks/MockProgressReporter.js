/**
 * Mock Progress Reporter
 *
 * Captures progress events for testing without console output.
 */
export class MockProgressReporter {
  constructor() {
    this.events = [];
    this.stages = {};
    this.subscribers = [];
  }

  /**
   * Report progress event
   */
  report(stage, progress, message, metadata = {}) {
    const event = {
      stage,
      progress,
      message,
      metadata,
      timestamp: Date.now()
    };

    this.events.push(event);

    // Track latest progress per stage
    this.stages[stage] = {
      progress,
      message,
      lastUpdate: event.timestamp
    };

    // Notify subscribers
    this.subscribers.forEach(callback => {
      callback(event);
    });

    return event;
  }

  /**
   * Subscribe to progress events
   */
  subscribe(callback) {
    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Get all events
   */
  getEvents() {
    return [...this.events];
  }

  /**
   * Get events for specific stage
   */
  getEventsForStage(stage) {
    return this.events.filter(e => e.stage === stage);
  }

  /**
   * Get latest event
   */
  getLatestEvent() {
    return this.events[this.events.length - 1] || null;
  }

  /**
   * Get latest event for stage
   */
  getLatestEventForStage(stage) {
    const events = this.getEventsForStage(stage);
    return events[events.length - 1] || null;
  }

  /**
   * Get stage progress
   */
  getStageProgress(stage) {
    return this.stages[stage] || null;
  }

  /**
   * Get all stages
   */
  getAllStages() {
    return { ...this.stages };
  }

  /**
   * Check if stage completed (reached 100%)
   */
  isStageComplete(stage) {
    const stageData = this.stages[stage];
    return stageData ? stageData.progress === 100 : false;
  }

  /**
   * Get completion status for all stages
   */
  getCompletionStatus() {
    const status = {};
    for (const [stage, data] of Object.entries(this.stages)) {
      status[stage] = data.progress === 100;
    }
    return status;
  }

  /**
   * Get timeline (events in chronological order)
   */
  getTimeline() {
    return this.events.map(e => ({
      stage: e.stage,
      progress: e.progress,
      message: e.message,
      timestamp: e.timestamp,
      elapsed: e.timestamp - (this.events[0]?.timestamp || e.timestamp)
    }));
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const totalEvents = this.events.length;
    const stageCount = Object.keys(this.stages).length;
    const completedStages = Object.values(this.stages).filter(s => s.progress === 100).length;
    const duration = this.events.length > 0
      ? this.events[this.events.length - 1].timestamp - this.events[0].timestamp
      : 0;

    return {
      totalEvents,
      stageCount,
      completedStages,
      duration,
      averageTimePerEvent: totalEvents > 0 ? duration / totalEvents : 0
    };
  }

  /**
   * Wait for stage to complete
   */
  async waitForStageCompletion(stage, timeout = 5000) {
    return new Promise((resolve, reject) => {
      // Check if already complete
      if (this.isStageComplete(stage)) {
        resolve(this.stages[stage]);
        return;
      }

      // Set up timeout
      const timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timeout waiting for stage '${stage}' to complete`));
      }, timeout);

      // Subscribe to events
      const unsubscribe = this.subscribe(event => {
        if (event.stage === stage && event.progress === 100) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(this.stages[stage]);
        }
      });
    });
  }

  /**
   * Wait for specific progress in stage
   */
  async waitForProgress(stage, targetProgress, timeout = 5000) {
    return new Promise((resolve, reject) => {
      // Check if already reached
      const current = this.stages[stage];
      if (current && current.progress >= targetProgress) {
        resolve(current);
        return;
      }

      // Set up timeout
      const timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timeout waiting for stage '${stage}' to reach ${targetProgress}%`));
      }, timeout);

      // Subscribe to events
      const unsubscribe = this.subscribe(event => {
        if (event.stage === stage && event.progress >= targetProgress) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(this.stages[stage]);
        }
      });
    });
  }

  /**
   * Reset all events and stages
   */
  reset() {
    this.events = [];
    this.stages = {};
  }

  /**
   * Clear events but keep stage state
   */
  clearEvents() {
    this.events = [];
  }

  /**
   * Export data for analysis
   */
  export() {
    return {
      events: this.getEvents(),
      stages: this.getAllStages(),
      timeline: this.getTimeline(),
      statistics: this.getStatistics()
    };
  }

  /**
   * Pretty print progress (for debugging)
   */
  toString() {
    const lines = ['Progress Report:', ''];

    for (const [stage, data] of Object.entries(this.stages)) {
      const bar = '█'.repeat(Math.floor(data.progress / 5)) +
                  '░'.repeat(20 - Math.floor(data.progress / 5));
      lines.push(`${stage}: [${bar}] ${data.progress}% - ${data.message}`);
    }

    lines.push('');
    lines.push(`Total Events: ${this.events.length}`);
    lines.push(`Completed Stages: ${Object.values(this.stages).filter(s => s.progress === 100).length}/${Object.keys(this.stages).length}`);

    return lines.join('\n');
  }
}
