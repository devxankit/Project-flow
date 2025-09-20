# Activity System Documentation

## Overview

The Activity System provides comprehensive tracking and logging of all user actions within the Project Flow platform. It implements role-based access control to ensure users only see activities relevant to their role and assigned projects.

## Architecture

### Core Components

1. **Activity Model** (`models/Activity.js`)
   - Central data structure for storing activity records
   - Supports multiple activity types and metadata
   - Implements role-based visibility controls

2. **Activity Controller** (`controllers/activityController.js`)
   - Handles activity creation and retrieval
   - Implements role-based access logic
   - Provides helper functions for different activity types

3. **Activity Routes** (`routes/activityRoutes.js`)
   - RESTful API endpoints for activity operations
   - Protected routes with authentication and authorization

4. **Frontend Integration**
   - Updated API utilities (`frontend/src/utils/api.js`)
   - Enhanced Activity page (`frontend/src/pages/Activity.jsx`)
   - Real-time activity display with filtering

## Activity Types

### Project Activities
- `project_created` - New project created
- `project_updated` - Project details modified
- `project_status_changed` - Project status updated
- `project_completed` - Project marked as completed
- `project_cancelled` - Project cancelled

### Milestone Activities
- `milestone_created` - New milestone created
- `milestone_updated` - Milestone details modified
- `milestone_status_changed` - Milestone status updated
- `milestone_completed` - Milestone completed
- `milestone_cancelled` - Milestone cancelled

### Task Activities
- `task_created` - New task created
- `task_updated` - Task details modified
- `task_status_changed` - Task status updated
- `task_assigned` - Task assigned to user
- `task_unassigned` - Task unassigned from user
- `task_completed` - Task completed
- `task_cancelled` - Task cancelled

### Team Activities
- `team_member_added` - User added to project team
- `team_member_removed` - User removed from project team

### Comment Activities
- `comment_added` - Comment added to task/milestone
- `comment_updated` - Comment modified
- `comment_deleted` - Comment removed

### File Activities
- `file_uploaded` - File uploaded to project/task
- `file_deleted` - File removed

### User Activities
- `user_joined` - User joined the platform
- `user_left` - User left the platform
- `user_role_changed` - User role modified

## Role-Based Access Control

### Project Manager (PM)
- **Access Level**: Full platform access
- **Can See**: All activities across all projects
- **Can Create**: Manual activities (via API)
- **Use Case**: Complete oversight and monitoring

### Employee
- **Access Level**: Project-specific access
- **Can See**: 
  - Activities from projects they're assigned to
  - Activities where they are the actor
  - Activities explicitly shared with them
- **Cannot See**: Activities from unassigned projects
- **Use Case**: Focused on their work and team activities

### Customer
- **Access Level**: Own projects only
- **Can See**:
  - Activities from their own projects
  - Activities where they are the actor
  - Activities explicitly shared with them
- **Cannot See**: Activities from other customers' projects
- **Use Case**: Monitor progress on their projects

## API Endpoints

### Get Activities
```
GET /api/activities
```
**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by activity type
- `projectId` (optional): Filter by specific project

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [...],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 100,
      "limit": 20
    }
  }
}
```

### Get Project Activities
```
GET /api/activities/project/:projectId
```
**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by activity type

### Get Activity Statistics
```
GET /api/activities/stats
```
**Parameters:**
- `timeRange` (optional): Time range for stats (1d, 7d, 30d)

### Get Activity by ID
```
GET /api/activities/:id
```

### Create Activity (PM only)
```
POST /api/activities
```
**Body:**
```json
{
  "type": "project_created",
  "title": "Project Created",
  "description": "New project was created",
  "target": "project_id",
  "targetModel": "Project",
  "project": "project_id",
  "metadata": {},
  "priority": "normal"
}
```

## Database Schema

### Activity Collection
```javascript
{
  _id: ObjectId,
  type: String, // Activity type
  title: String, // Activity title
  description: String, // Activity description
  actor: ObjectId, // User who performed the action
  target: ObjectId, // What was affected (optional)
  targetModel: String, // Model type of target
  project: ObjectId, // Project context
  metadata: Object, // Additional data
  visibility: String, // public, team, private
  visibleTo: [ObjectId], // Specific users who can see this
  priority: String, // low, normal, high, urgent
  timestamp: Date, // When the activity occurred
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `{ project: 1, timestamp: -1 }` - Project activities by time
- `{ actor: 1, timestamp: -1 }` - User activities by time
- `{ type: 1, timestamp: -1 }` - Activities by type
- `{ target: 1, targetModel: 1 }` - Target-based queries
- `{ visibleTo: 1, timestamp: -1 }` - Visibility queries

## Integration Points

### Automatic Activity Creation

Activities are automatically created when:

1. **Project Operations**
   - Project created → `project_created` activity
   - Project updated → `project_updated` activity
   - Project status changed → `project_status_changed` activity

2. **Task Operations**
   - Task created → `task_created` activity
   - Task updated → `task_updated` activity
   - Task status changed → `task_status_changed` activity
   - Task assigned → `task_assigned` activity

3. **Milestone Operations**
   - Milestone created → `milestone_created` activity
   - Milestone updated → `milestone_updated` activity
   - Milestone status changed → `milestone_status_changed` activity

4. **Team Operations**
   - Team member added → `team_member_added` activity
   - Team member removed → `team_member_removed` activity

### Controller Integration

The following controllers have been updated to create activities:

- `projectController.js` - Project-related activities
- `taskController.js` - Task-related activities
- `milestoneController.js` - Milestone-related activities

## Frontend Integration

### API Utilities
The `frontend/src/utils/api.js` file includes:
- `activityApi.getActivities()` - Get user activities
- `activityApi.getStats()` - Get activity statistics
- `activityApi.getProjectActivities()` - Get project activities
- `activityApi.getActivityById()` - Get specific activity
- `activityApi.createActivity()` - Create manual activity (PM only)

### Activity Page
The `frontend/src/pages/Activity.jsx` has been updated to:
- Fetch real activity data from the API
- Display activities based on user role
- Support filtering by activity type
- Show loading states and error handling
- Display activity metadata and relationships

## Testing

### Test Script
Run the comprehensive test suite:
```bash
node scripts/runActivityTests.js
```

### Test Coverage
The test suite covers:
1. Activity model creation and validation
2. Role-based activity creation (Project, Task, Milestone, Team)
3. Role-based activity retrieval (PM, Employee, Customer)
4. Project-specific activity filtering
5. Activity statistics generation
6. Activity type filtering
7. Pagination functionality
8. Access control validation

### Test Data
The test script creates:
- Test users (PM, Employee, Customer)
- Test project with team assignments
- Test milestone and task
- Various activity types
- Verifies access control rules

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields
- Pagination to limit result sets
- Efficient aggregation for statistics

### Caching Strategy
- Consider implementing Redis caching for frequently accessed activities
- Cache activity statistics for better performance

### Query Optimization
- Use projection to limit returned fields
- Implement proper pagination
- Filter at database level when possible

## Security Considerations

### Access Control
- All routes protected with authentication middleware
- Role-based access control enforced at database level
- Users can only see activities they have permission to view

### Data Validation
- Input validation on all activity creation endpoints
- Sanitization of user-provided content
- Type checking for activity metadata

### Privacy
- Sensitive information excluded from activity descriptions
- Proper visibility controls for different activity types
- Audit trail for all activity access

## Monitoring and Analytics

### Activity Metrics
- Total activities by type
- User activity patterns
- Project activity trends
- System usage statistics

### Performance Monitoring
- Query performance tracking
- Database index usage
- API response times
- Error rate monitoring

## Future Enhancements

### Planned Features
1. **Real-time Updates** - WebSocket integration for live activity feeds
2. **Activity Notifications** - Email/push notifications for important activities
3. **Activity Export** - Export activity data for reporting
4. **Advanced Filtering** - Date ranges, user filters, project filters
5. **Activity Templates** - Customizable activity templates
6. **Bulk Operations** - Bulk activity creation and management

### Integration Opportunities
1. **Slack Integration** - Post activities to Slack channels
2. **Email Integration** - Send activity summaries via email
3. **Calendar Integration** - Sync milestone activities with calendars
4. **Reporting Integration** - Generate activity reports

## Troubleshooting

### Common Issues

1. **Activities Not Appearing**
   - Check user role and project assignments
   - Verify activity visibility settings
   - Check database indexes

2. **Performance Issues**
   - Review query patterns
   - Check index usage
   - Consider pagination limits

3. **Access Control Issues**
   - Verify user permissions
   - Check project assignments
   - Review activity visibility rules

### Debug Tools
- Activity test script for validation
- Database query logging
- API endpoint testing
- Frontend console debugging

## Conclusion

The Activity System provides a robust foundation for tracking and monitoring user actions within the Project Flow platform. With proper role-based access control, comprehensive activity types, and efficient data retrieval, it enables effective project management and team collaboration while maintaining security and privacy standards.
