
/**
 * Main ESPN service file that re-exports from the modular structure
 * This maintains backward compatibility with the rest of the codebase
 */

import { ESPNService, TeamWithConference } from './espn/index';
import type { ESPNTeam, ScoutingReport } from './espn/index';

// Re-export types and service for backward compatibility
export { ESPNService, ESPNTeam, TeamWithConference, ScoutingReport };
