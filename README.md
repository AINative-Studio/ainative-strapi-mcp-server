# AINative Strapi MCP Server

[![npm version](https://img.shields.io/npm/v/ainative-strapi-mcp-server.svg)](https://www.npmjs.com/package/ainative-strapi-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Natural language blog publishing and content management for Strapi CMS. Production-ready MCP (Model Context Protocol) integration for AI assistants.

## Features

- **Blog Post Management**: Create, read, update, publish blog posts with markdown support
- **Tutorial System**: Create step-by-step tutorials with difficulty levels and duration tracking
- **Event Management**: Manage webinars, workshops, meetups, and conferences
- **Advanced Filtering**: Search and filter by categories, tags, authors, difficulty, event types
- **Metadata Operations**: List authors, categories, and tags
- **Production Ready**: Tested with 100% pass rate on comprehensive test suite

## Installation

### Global Installation

```bash
npm install -g ainative-strapi-mcp-server
```

### For MCP-Compatible AI Assistants

Add to your MCP configuration file:

```json
{
  "mcpServers": {
    "ainative-strapi": {
      "command": "ainative-strapi-mcp",
      "args": [],
      "env": {
        "STRAPI_URL": "https://your-strapi-instance.com",
        "STRAPI_ADMIN_EMAIL": "your-admin@example.com",
        "STRAPI_ADMIN_PASSWORD": "your-secure-password"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRAPI_URL` | Yes | Your Strapi instance URL (e.g., `https://cms.example.com`) |
| `STRAPI_ADMIN_EMAIL` | Yes | Admin email for authentication |
| `STRAPI_ADMIN_PASSWORD` | Yes | Admin password for authentication |

## Available Operations

### Blog Post Operations (6)

1. **strapi_create_blog_post** - Create a new blog post
2. **strapi_list_blog_posts** - List blog posts with advanced filtering
3. **strapi_get_blog_post** - Get a specific blog post by document ID
4. **strapi_update_blog_post** - Update an existing blog post
5. **strapi_publish_blog_post** - Publish or unpublish a blog post
6. **strapi_list_authors** - List all authors
7. **strapi_list_categories** - List all blog categories
8. **strapi_list_tags** - List all blog tags

### Tutorial Operations (5)

1. **strapi_create_tutorial** - Create a step-by-step tutorial
2. **strapi_list_tutorials** - List tutorials with filtering
3. **strapi_get_tutorial** - Get a specific tutorial by document ID
4. **strapi_update_tutorial** - Update an existing tutorial
5. **strapi_publish_tutorial** - Publish or unpublish a tutorial

### Event Operations (5)

1. **strapi_create_event** - Create a new event
2. **strapi_list_events** - List events with filtering
3. **strapi_get_event** - Get a specific event by document ID
4. **strapi_update_event** - Update an existing event
5. **strapi_publish_event** - Publish or unpublish an event

## Usage Examples

### Creating a Blog Post

```javascript
strapi_create_blog_post({
  title: "Getting Started with AI Development",
  content: "# Introduction\n\nLet's explore AI development...",
  description: "A beginner's guide to AI development",
  author_id: 1,
  category_id: 2,
  tag_ids: [1, 3, 5]
})
```

### Listing Blog Posts with Filters

```javascript
strapi_list_blog_posts({
  status: "published",
  category_id: 2,
  page: 1,
  pageSize: 10,
  sort: "publishedAt:desc"
})
```

### Creating a Tutorial

```javascript
strapi_create_tutorial({
  title: "Building Your First AI Agent",
  content: "# Step 1: Setup\n\nFirst, install the required packages...",
  description: "Learn to build AI agents from scratch",
  difficulty: "beginner",
  duration: 30,
  author_id: 1
})
```

### Creating an Event

```javascript
strapi_create_event({
  title: "AI Development Workshop",
  description: "Hands-on workshop for building AI applications",
  event_type: "workshop",
  start_date: "2025-02-15T10:00:00Z",
  end_date: "2025-02-15T16:00:00Z",
  location: "Virtual - Zoom",
  registration_url: "https://example.com/register",
  max_attendees: 50
})
```

## Version History

### v1.0.0 (2025-12-13)
- Initial release
- Support for blog posts, tutorials, and events
- 18 operations with full CRUD capabilities
- Advanced filtering and search
- Production-ready with comprehensive testing

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/AINative-Studio/ainative-strapi-mcp-server/issues
- Email: support@ainative.studio
- Website: https://ainative.studio

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

Built by AINative Studio for the Model Context Protocol ecosystem.
