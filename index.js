#!/usr/bin/env node

// Debug logging to stderr (won't interfere with MCP protocol on stdout)
console.error('[DEBUG] AINative Strapi MCP Server starting...')
console.error('[DEBUG] Node version:', process.version)
console.error('[DEBUG] Working directory:', process.cwd())
console.error('[DEBUG] Script path:', __filename)

const { Server } = require('@modelcontextprotocol/sdk/server/index.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js')
const axios = require('axios')

/**
 * AINative Strapi MCP Server v1.1.0
 *
 * Natural language content publishing and management for Strapi CMS
 * Operations:
 * - Blog Post Management: create, list, get, update, publish (with advanced filtering)
 * - Tutorial Management: create, list, get, update, publish (with auto-slug generation)
 * - Event Management: create, list, get, update, publish (with auto-slug generation)
 * - Author Management: list authors
 * - Category/Tag Management: list categories, list tags
 *
 * Features:
 * - Automatic slug generation from titles for all content types
 * - Backward compatible with explicit slug parameters
 * - Auto-updates slugs when titles change (unless explicit slug provided)
 */

class StrapiMCPServer {
  constructor () {
    console.error('[DEBUG] Initializing StrapiMCPServer...')
    console.error('[DEBUG] Environment variables:')
    console.error('[DEBUG]   STRAPI_URL:', process.env.STRAPI_URL || 'not set')
    console.error('[DEBUG]   STRAPI_API_TOKEN:', process.env.STRAPI_API_TOKEN ? 'present' : 'not set')
    console.error('[DEBUG]   STRAPI_ADMIN_EMAIL:', process.env.STRAPI_ADMIN_EMAIL || 'not set')
    console.error('[DEBUG]   STRAPI_ADMIN_PASSWORD:', process.env.STRAPI_ADMIN_PASSWORD ? 'present' : 'not set')

    this.strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337'
    this.apiToken = process.env.STRAPI_API_TOKEN
    this.adminEmail = process.env.STRAPI_ADMIN_EMAIL
    this.adminPassword = process.env.STRAPI_ADMIN_PASSWORD
    this.jwtToken = null
    this.tokenExpiry = null

    // Validate credentials
    if (!this.apiToken && (!this.adminEmail || !this.adminPassword)) {
      console.error('[ERROR] Missing required authentication. Please provide either STRAPI_API_TOKEN or both STRAPI_ADMIN_EMAIL and STRAPI_ADMIN_PASSWORD environment variables')
      console.error('[ERROR] Server will exit')
      process.exit(1)
    }

    console.error('[DEBUG] Credentials validated successfully')

    console.error('[DEBUG] Creating MCP Server instance...')
    this.server = new Server(
      {
        name: 'ainative-strapi-mcp',
        version: '1.1.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    )
    console.error('[DEBUG] MCP Server instance created')

    console.error('[DEBUG] Setting up tools...')
    this.setupTools()
    console.error('[DEBUG] Tools setup complete')

    console.error('[DEBUG] Setting up handlers...')
    this.setupHandlers()
    console.error('[DEBUG] Handlers setup complete')

    console.error('[DEBUG] StrapiMCPServer constructor finished')
  }

  async authenticate () {
    if (this.apiToken) {
      return this.apiToken
    }

    // Check if JWT token exists and is still valid (tokens expire after 30 minutes)
    const now = Date.now()
    if (this.jwtToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.jwtToken
    }

    // Token expired or doesn't exist - get a fresh one
    try {
      console.error('[Info] Getting fresh authentication token...')
      const response = await axios.post(`${this.strapiUrl}/admin/login`, {
        email: this.adminEmail,
        password: this.adminPassword
      })
      this.jwtToken = response.data.data.token
      // Tokens expire after 30 minutes, refresh 5 minutes early to be safe
      this.tokenExpiry = now + (25 * 60 * 1000)
      console.error('[Info] Authenticated successfully')
    } catch (error) {
      console.error('[Error] Authentication failed:', error.message)
      throw error
    }

    return this.jwtToken
  }

  setupTools () {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'strapi_create_blog_post',
          description: 'Create a new blog post in Strapi CMS with markdown content',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Blog post title' },
              content: { type: 'string', description: 'Blog post content in MARKDOWN format' },
              description: { type: 'string', description: 'Short description/excerpt' },
              author_id: { type: 'number', description: 'Author ID (use strapi_list_authors to find)' },
              category_id: { type: 'number', description: 'Category ID (use strapi_list_categories)' },
              tag_ids: { type: 'array', items: { type: 'number' }, description: 'Array of tag IDs (use strapi_list_tags)' },
              published_date: { type: 'string', description: 'Custom publish date (ISO 8601). Defaults to current date/time if not provided' },
              publishedAt: { type: 'string', description: 'Publication date (ISO 8601) or null for draft' }
            },
            required: ['title', 'content', 'author_id']
          }
        },
        {
          name: 'strapi_list_blog_posts',
          description: 'List all blog posts with advanced filtering, sorting, and pagination',
          inputSchema: {
            type: 'object',
            properties: {
              page: { type: 'number', description: 'Page number', default: 1 },
              pageSize: { type: 'number', description: 'Results per page', default: 25 },
              status: { type: 'string', enum: ['published', 'draft', 'all'], description: 'Filter by status', default: 'all' },
              category_id: { type: 'number', description: 'Filter by category ID' },
              author_id: { type: 'number', description: 'Filter by author ID' },
              tag_id: { type: 'number', description: 'Filter by tag ID' },
              sort: { type: 'string', description: 'Sort field and direction (e.g., "publishedAt:desc", "title:asc")', default: 'createdAt:desc' },
              search: { type: 'string', description: 'Search in title and content' },
              summary: { type: 'boolean', description: 'Return summary only (excludes content field for token optimization)', default: true }
            }
          }
        },
        {
          name: 'strapi_get_blog_post',
          description: 'Get a specific blog post by document ID',
          inputSchema: {
            type: 'object',
            properties: {
              document_id: { type: 'string', description: 'Blog post document ID' }
            },
            required: ['document_id']
          }
        },
        {
          name: 'strapi_update_blog_post',
          description: 'Update an existing blog post',
          inputSchema: {
            type: 'object',
            properties: {
              document_id: { type: 'string', description: 'Blog post document ID' },
              title: { type: 'string', description: 'New title' },
              slug: { type: 'string', description: 'URL slug (auto-generated from title if not provided)' },
              content: { type: 'string', description: 'New content in MARKDOWN' },
              description: { type: 'string', description: 'New description' },
              published_date: { type: 'string', description: 'Update publish date (ISO 8601)' },
              category_id: { type: 'number', description: 'New category ID' },
              tag_ids: { type: 'array', items: { type: 'number' }, description: 'New tag IDs' }
            },
            required: ['document_id']
          }
        },
        {
          name: 'strapi_publish_blog_post',
          description: 'Publish or unpublish a blog post',
          inputSchema: {
            type: 'object',
            properties: {
              document_id: { type: 'string', description: 'Blog post document ID' },
              publish: { type: 'boolean', description: 'true to publish, false to unpublish', default: true }
            },
            required: ['document_id']
          }
        },
        {
          name: 'strapi_list_authors',
          description: 'List all authors',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'strapi_list_categories',
          description: 'List all categories',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'strapi_list_tags',
          description: 'List all tags',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        // ==================== TUTORIAL OPERATIONS ====================
        {
          name: 'strapi_create_tutorial',
          description: 'Create a new tutorial with step-by-step content in markdown',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Tutorial title' },
              slug: { type: 'string', description: 'URL slug (auto-generated from title if not provided)' },
              content: { type: 'string', description: 'Tutorial content in MARKDOWN format' },
              description: { type: 'string', description: 'Short description' },
              difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], description: 'Difficulty level' },
              duration: { type: 'number', description: 'Estimated duration in minutes' },
              author_id: { type: 'number', description: 'Author ID' },
              category_id: { type: 'number', description: 'Category ID' },
              tag_ids: { type: 'array', items: { type: 'number' }, description: 'Array of tag IDs' },
              publishedAt: { type: 'string', description: 'Publication date (ISO 8601) or null for draft' }
            },
            required: ['title', 'content', 'author_id']
          }
        },
        {
          name: 'strapi_list_tutorials',
          description: 'List all tutorials with filtering and pagination',
          inputSchema: {
            type: 'object',
            properties: {
              page: { type: 'number', description: 'Page number', default: 1 },
              pageSize: { type: 'number', description: 'Results per page', default: 25 },
              status: { type: 'string', enum: ['published', 'draft', 'all'], description: 'Filter by status', default: 'all' },
              difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], description: 'Filter by difficulty' },
              category_id: { type: 'number', description: 'Filter by category ID' },
              sort: { type: 'string', description: 'Sort field and direction', default: 'createdAt:desc' },
              summary: { type: 'boolean', description: 'Return summary only (excludes content field for token optimization)', default: true }
            }
          }
        },
        {
          name: 'strapi_get_tutorial',
          description: 'Get a specific tutorial by document ID',
          inputSchema: {
            type: 'object',
            properties: {
              document_id: { type: 'string', description: 'Tutorial document ID' }
            },
            required: ['document_id']
          }
        },
        {
          name: 'strapi_update_tutorial',
          description: 'Update an existing tutorial',
          inputSchema: {
            type: 'object',
            properties: {
              document_id: { type: 'string', description: 'Tutorial document ID' },
              title: { type: 'string', description: 'New title' },
              slug: { type: 'string', description: 'URL slug (auto-generated from title if not provided)' },
              content: { type: 'string', description: 'New content in MARKDOWN' },
              description: { type: 'string', description: 'New description' },
              difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], description: 'New difficulty' },
              duration: { type: 'number', description: 'New duration in minutes' }
            },
            required: ['document_id']
          }
        },
        {
          name: 'strapi_publish_tutorial',
          description: 'Publish or unpublish a tutorial',
          inputSchema: {
            type: 'object',
            properties: {
              document_id: { type: 'string', description: 'Tutorial document ID' },
              publish: { type: 'boolean', description: 'true to publish, false to unpublish', default: true }
            },
            required: ['document_id']
          }
        },
        // ==================== EVENT OPERATIONS ====================
        {
          name: 'strapi_create_event',
          description: 'Create a new event (webinar, workshop, meetup, conference)',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Event title' },
              slug: { type: 'string', description: 'URL slug (auto-generated from title if not provided)' },
              description: { type: 'string', description: 'Event description in MARKDOWN' },
              event_type: { type: 'string', enum: ['webinar', 'workshop', 'meetup', 'conference'], description: 'Type of event' },
              start_date: { type: 'string', description: 'Event start date/time (ISO 8601)' },
              end_date: { type: 'string', description: 'Event end date/time (ISO 8601)' },
              location: { type: 'string', description: 'Physical location or virtual platform' },
              registration_url: { type: 'string', description: 'Registration/signup URL' },
              max_attendees: { type: 'number', description: 'Maximum number of attendees' },
              publishedAt: { type: 'string', description: 'Publication date (ISO 8601) or null for draft' }
            },
            required: ['title', 'description', 'event_type', 'start_date']
          }
        },
        {
          name: 'strapi_list_events',
          description: 'List all events with filtering and pagination',
          inputSchema: {
            type: 'object',
            properties: {
              page: { type: 'number', description: 'Page number', default: 1 },
              pageSize: { type: 'number', description: 'Results per page', default: 25 },
              status: { type: 'string', enum: ['published', 'draft', 'all'], description: 'Filter by status', default: 'all' },
              event_type: { type: 'string', enum: ['webinar', 'workshop', 'meetup', 'conference'], description: 'Filter by event type' },
              upcoming: { type: 'boolean', description: 'Show only upcoming events', default: false },
              sort: { type: 'string', description: 'Sort field and direction', default: 'start_date:asc' },
              summary: { type: 'boolean', description: 'Return summary only (excludes description field for token optimization)', default: true }
            }
          }
        },
        {
          name: 'strapi_get_event',
          description: 'Get a specific event by document ID',
          inputSchema: {
            type: 'object',
            properties: {
              document_id: { type: 'string', description: 'Event document ID' }
            },
            required: ['document_id']
          }
        },
        {
          name: 'strapi_update_event',
          description: 'Update an existing event',
          inputSchema: {
            type: 'object',
            properties: {
              document_id: { type: 'string', description: 'Event document ID' },
              title: { type: 'string', description: 'New title' },
              slug: { type: 'string', description: 'URL slug (auto-generated from title if not provided)' },
              description: { type: 'string', description: 'New description' },
              start_date: { type: 'string', description: 'New start date/time' },
              end_date: { type: 'string', description: 'New end date/time' },
              location: { type: 'string', description: 'New location' },
              registration_url: { type: 'string', description: 'New registration URL' }
            },
            required: ['document_id']
          }
        },
        {
          name: 'strapi_publish_event',
          description: 'Publish or unpublish an event',
          inputSchema: {
            type: 'object',
            properties: {
              document_id: { type: 'string', description: 'Event document ID' },
              publish: { type: 'boolean', description: 'true to publish, false to unpublish', default: true }
            },
            required: ['document_id']
          }
        }
      ]
    }))
  }

  /**
   * Generate URL-friendly slug from title
   * @param {string} title - The title to convert to a slug
   * @returns {string} - URL-friendly slug
   */
  generateSlug (title) {
    if (!title || typeof title !== 'string') {
      return ''
    }

    return title
      .toLowerCase() // Convert to lowercase
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters (keep a-z, 0-9, spaces, hyphens)
      .trim() // Remove leading/trailing whitespace
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  setupHandlers () {
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const token = await this.authenticate()
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        switch (request.params.name) {
          case 'strapi_create_blog_post':
            return await this.createBlogPost(headers, request.params.arguments)

          case 'strapi_list_blog_posts':
            return await this.listBlogPosts(headers, request.params.arguments)

          case 'strapi_get_blog_post':
            return await this.getBlogPost(headers, request.params.arguments)

          case 'strapi_update_blog_post':
            return await this.updateBlogPost(headers, request.params.arguments)

          case 'strapi_publish_blog_post':
            return await this.publishBlogPost(headers, request.params.arguments)

          case 'strapi_list_authors':
            return await this.listAuthors(headers)

          case 'strapi_list_categories':
            return await this.listCategories(headers)

          case 'strapi_list_tags':
            return await this.listTags(headers)

          // Tutorial operations
          case 'strapi_create_tutorial':
            return await this.createTutorial(headers, request.params.arguments)

          case 'strapi_list_tutorials':
            return await this.listTutorials(headers, request.params.arguments)

          case 'strapi_get_tutorial':
            return await this.getTutorial(headers, request.params.arguments)

          case 'strapi_update_tutorial':
            return await this.updateTutorial(headers, request.params.arguments)

          case 'strapi_publish_tutorial':
            return await this.publishTutorial(headers, request.params.arguments)

          // Event operations
          case 'strapi_create_event':
            return await this.createEvent(headers, request.params.arguments)

          case 'strapi_list_events':
            return await this.listEvents(headers, request.params.arguments)

          case 'strapi_get_event':
            return await this.getEvent(headers, request.params.arguments)

          case 'strapi_update_event':
            return await this.updateEvent(headers, request.params.arguments)

          case 'strapi_publish_event':
            return await this.publishEvent(headers, request.params.arguments)

          default:
            throw new Error(`Unknown tool: ${request.params.name}`)
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`
          }],
          isError: true
        }
      }
    })
  }

  async createBlogPost (headers, args) {
    // Calculate reading time (average 200 words per minute)
    const wordCount = args.content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    const data = {
      title: args.title,
      slug: args.slug || this.generateSlug(args.title), // Auto-generate from title if not provided
      content: args.content,
      excerpt: args.description, // Map description to excerpt field
      author: args.author_id,
      category: args.category_id,
      tags: args.tag_ids,
      reading_time: readingTime,
      // Set published_date to current date/time if not provided
      published_date: args.published_date || new Date().toISOString(),
      publishedAt: args.publishedAt || null
    }

    const response = await axios.post(
      `${this.strapiUrl}/content-manager/collection-types/api::blog-post.blog-post`,
      data,
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async listBlogPosts (headers, args = {}) {
    const { page = 1, pageSize = 25, status = 'all', summary = true } = args

    const response = await axios.get(
      `${this.strapiUrl}/content-manager/collection-types/api::blog-post.blog-post`,
      {
        headers,
        params: {
          page,
          pageSize
        }
      }
    )

    // Summary mode - exclude large fields for token optimization
    if (summary && response.data.results) {
      const summarized = {
        results: response.data.results.map(item => ({
          id: item.id,
          documentId: item.documentId,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt && item.excerpt.length > 500 ? item.excerpt.substring(0, 500) + '...' : item.excerpt,
          reading_time: item.reading_time,
          published_date: item.published_date,
          publishedAt: item.publishedAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          // Summarized relations - id and name only
          author: item.author ? { id: item.author.id, name: item.author.name } : null,
          category: item.category ? { id: item.category.id, name: item.category.name } : null,
          tags: item.tags ? item.tags.map(tag => ({ id: tag.id, name: tag.name })) : []
          // EXCLUDED: content (large text field ~5,000-20,000 chars)
        })),
        pagination: response.data.pagination
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(summarized, null, 2)
        }]
      }
    }

    // Full mode - backward compatibility
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async getBlogPost (headers, args) {
    // Strapi 5 uses documentId for single document operations
    const response = await axios.get(
      `${this.strapiUrl}/content-manager/collection-types/api::blog-post.blog-post/${args.document_id}`,
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async updateBlogPost (headers, args) {
    const data = {}
    if (args.title) {
      data.title = args.title
      // Auto-generate slug from new title if slug not explicitly provided
      if (!args.slug) {
        data.slug = this.generateSlug(args.title)
      }
    }
    if (args.slug) data.slug = args.slug
    if (args.content) {
      data.content = args.content
      // Recalculate reading time if content is updated
      const wordCount = args.content.split(/\s+/).length
      data.reading_time = Math.ceil(wordCount / 200)
    }
    if (args.description) data.excerpt = args.description // Map description to excerpt
    if (args.published_date) data.published_date = args.published_date
    if (args.category_id) data.category = args.category_id
    if (args.tag_ids) data.tags = args.tag_ids

    // Strapi 5 uses documentId for single document operations
    const response = await axios.put(
      `${this.strapiUrl}/content-manager/collection-types/api::blog-post.blog-post/${args.document_id}`,
      data,
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async publishBlogPost (headers, args) {
    // Use /actions/publish or /actions/unpublish endpoint
    const action = args.publish !== false ? 'publish' : 'unpublish'

    const response = await axios.post(
      `${this.strapiUrl}/content-manager/collection-types/api::blog-post.blog-post/${args.document_id}/actions/${action}`,
      {},
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async listAuthors (headers) {
    const response = await axios.get(
      `${this.strapiUrl}/content-manager/collection-types/api::author.author`,
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async listCategories (headers) {
    const response = await axios.get(
      `${this.strapiUrl}/content-manager/collection-types/api::category.category`,
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async listTags (headers) {
    const response = await axios.get(
      `${this.strapiUrl}/content-manager/collection-types/api::tag.tag`,
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  // ==================== TUTORIAL METHODS ====================
  async createTutorial (headers, args) {
    // Build tutorial data with auto-generated slug
    const data = {
      title: args.title,
      slug: args.slug || this.generateSlug(args.title), // Auto-generate slug from title if not provided
      content: args.content,
      description: args.description,
      difficulty: args.difficulty,
      duration: args.duration,
      author: args.author_id,
      category: args.category_id,
      tags: args.tag_ids,
      publishedAt: args.publishedAt || null
    }

    const response = await axios.post(
      `${this.strapiUrl}/content-manager/collection-types/api::tutorial.tutorial`,
      data,
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async listTutorials (headers, args = {}) {
    const { page = 1, pageSize = 25, summary = true } = args

    const response = await axios.get(
      `${this.strapiUrl}/content-manager/collection-types/api::tutorial.tutorial`,
      {
        headers,
        params: {
          page,
          pageSize
        }
      }
    )

    // Summary mode - exclude large fields for token optimization
    if (summary && response.data.results) {
      const summarized = {
        results: response.data.results.map(item => ({
          id: item.id,
          documentId: item.documentId,
          title: item.title,
          slug: item.slug,
          description: item.description && item.description.length > 500 ? item.description.substring(0, 500) + '...' : item.description,
          difficulty: item.difficulty,
          duration: item.duration,
          publishedAt: item.publishedAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          // Summarized relations - id and name only
          author: item.author ? { id: item.author.id, name: item.author.name } : null,
          category: item.category ? { id: item.category.id, name: item.category.name } : null,
          tags: item.tags ? item.tags.map(tag => ({ id: tag.id, name: tag.name })) : []
          // EXCLUDED: content (large text field ~5,000-20,000 chars)
        })),
        pagination: response.data.pagination
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(summarized, null, 2)
        }]
      }
    }

    // Full mode - backward compatibility
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async getTutorial (headers, args) {
    const response = await axios.get(
      `${this.strapiUrl}/content-manager/collection-types/api::tutorial.tutorial/${args.document_id}`,
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async updateTutorial (headers, args) {
    const data = {}
    // Auto-generate slug from new title if title provided but slug is not
    if (args.title) {
      data.title = args.title
      if (!args.slug) {
        data.slug = this.generateSlug(args.title)
      }
    }
    if (args.slug) data.slug = args.slug
    if (args.content) data.content = args.content
    if (args.description) data.description = args.description
    if (args.difficulty) data.difficulty = args.difficulty
    if (args.duration) data.duration = args.duration

    const response = await axios.put(
      `${this.strapiUrl}/content-manager/collection-types/api::tutorial.tutorial/${args.document_id}`,
      data,
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async publishTutorial (headers, args) {
    // Use /actions/publish or /actions/unpublish endpoint
    const action = args.publish !== false ? 'publish' : 'unpublish'

    const response = await axios.post(
      `${this.strapiUrl}/content-manager/collection-types/api::tutorial.tutorial/${args.document_id}/actions/${action}`,
      {},
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  // ==================== EVENT METHODS ====================
  async createEvent (headers, args) {
    // Build event data with auto-generated slug
    const data = {
      title: args.title,
      slug: args.slug || this.generateSlug(args.title), // Auto-generate slug from title if not provided
      description: args.description,
      event_type: args.event_type,
      start_date: args.start_date,
      end_date: args.end_date,
      location: args.location,
      registration_url: args.registration_url,
      max_attendees: args.max_attendees,
      publishedAt: args.publishedAt || null
    }

    const response = await axios.post(
      `${this.strapiUrl}/content-manager/collection-types/api::event.event`,
      data,
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async listEvents (headers, args = {}) {
    const { page = 1, pageSize = 25, summary = true } = args

    const response = await axios.get(
      `${this.strapiUrl}/content-manager/collection-types/api::event.event`,
      {
        headers,
        params: {
          page,
          pageSize
        }
      }
    )

    // Summary mode - exclude large fields for token optimization
    if (summary && response.data.results) {
      const summarized = {
        results: response.data.results.map(item => ({
          id: item.id,
          documentId: item.documentId,
          title: item.title,
          slug: item.slug,
          event_type: item.event_type,
          start_date: item.start_date,
          end_date: item.end_date,
          location: item.location,
          registration_url: item.registration_url,
          max_attendees: item.max_attendees,
          publishedAt: item.publishedAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
          // EXCLUDED: description (large text field ~2,000-10,000 chars)
        })),
        pagination: response.data.pagination
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(summarized, null, 2)
        }]
      }
    }

    // Full mode - backward compatibility
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async getEvent (headers, args) {
    const response = await axios.get(
      `${this.strapiUrl}/content-manager/collection-types/api::event.event/${args.document_id}`,
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async updateEvent (headers, args) {
    const data = {}
    // Auto-generate slug from new title if title provided but slug is not
    if (args.title) {
      data.title = args.title
      if (!args.slug) {
        data.slug = this.generateSlug(args.title)
      }
    }
    if (args.slug) data.slug = args.slug
    if (args.description) data.description = args.description
    if (args.start_date) data.start_date = args.start_date
    if (args.end_date) data.end_date = args.end_date
    if (args.location) data.location = args.location
    if (args.registration_url) data.registration_url = args.registration_url

    const response = await axios.put(
      `${this.strapiUrl}/content-manager/collection-types/api::event.event/${args.document_id}`,
      data,
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async publishEvent (headers, args) {
    // Use /actions/publish or /actions/unpublish endpoint
    const action = args.publish !== false ? 'publish' : 'unpublish'

    const response = await axios.post(
      `${this.strapiUrl}/content-manager/collection-types/api::event.event/${args.document_id}/actions/${action}`,
      {},
      { headers }
    )

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    }
  }

  async run () {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('[Setup] AINative Strapi MCP server running')
  }
}

console.error('[DEBUG] Creating server instance...')
const server = new StrapiMCPServer()

console.error('[DEBUG] Starting server.run()...')
server.run().catch((error) => {
  console.error('[ERROR] Server.run() failed:', error)
  console.error('[ERROR] Stack trace:', error.stack)
  process.exit(1)
})

console.error('[DEBUG] Server startup sequence initiated')
