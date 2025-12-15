/**
 * Supabase Database Types
 * 
 * These types define the structure of your Supabase tables.
 * Run the SQL migrations to create these tables in your Supabase project.
 */

export type LeadSource = 
  | 'chatbot' 
  | 'contact_form' 
  | 'manual' 
  | 'newsletter' 
  | 'ebook'
  | 'guest_popup'
  | 'youtube_description'
  | 'instagram_bio'
  | 'paid_social'
  | 'landing_youtube'
  | 'landing_instagram'
  | 'landing_social';

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'archived';

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          interest: string;
          source: LeadSource;
          notes: string | null;
          tags: string[];
          status: LeadStatus;
          user_id: string | null; // Link to authenticated user if converted
          campaign: string | null; // UTM campaign tracking
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          interest: string;
          source: LeadSource;
          notes?: string | null;
          tags?: string[];
          status?: LeadStatus;
          user_id?: string | null;
          campaign?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          interest?: string;
          source?: LeadSource;
          notes?: string | null;
          tags?: string[];
          status?: LeadStatus;
          user_id?: string | null;
          campaign?: string | null;
          updated_at?: string;
        };
      };
      episodes: {
        Row: {
          id: string;
          title: string;
          description: string;
          duration: string;
          published_at: string;
          image_url: string;
          video_url: string | null;
          audio_url: string | null;
          spotify_url: string;
          youtube_url: string;
          apple_url: string;
          tags: string[];
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          duration: string;
          published_at: string;
          image_url: string;
          video_url?: string | null;
          audio_url?: string | null;
          spotify_url: string;
          youtube_url: string;
          apple_url: string;
          tags?: string[];
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          duration?: string;
          published_at?: string;
          image_url?: string;
          video_url?: string | null;
          audio_url?: string | null;
          spotify_url?: string;
          youtube_url?: string;
          apple_url?: string;
          tags?: string[];
          is_published?: boolean;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          currency: string;
          image_url: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          currency?: string;
          image_url?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          price?: number;
          currency?: string;
          image_url?: string | null;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          order_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          course_id?: string;
          title?: string;
          description?: string | null;
          order_index?: number;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content: string | null;
          video_url: string | null;
          duration_minutes: number | null;
          order_index: number;
          is_free_preview: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          content?: string | null;
          video_url?: string | null;
          duration_minutes?: number | null;
          order_index: number;
          is_free_preview?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          module_id?: string;
          title?: string;
          content?: string | null;
          video_url?: string | null;
          duration_minutes?: number | null;
          order_index?: number;
          is_free_preview?: boolean;
          updated_at?: string;
        };
      };
      seminars: {
        Row: {
          id: string;
          title: string;
          description: string;
          event_date: string;
          location: string | null;
          is_online: boolean;
          price: number;
          currency: string;
          max_attendees: number | null;
          image_url: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          event_date: string;
          location?: string | null;
          is_online?: boolean;
          price: number;
          currency?: string;
          max_attendees?: number | null;
          image_url?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          event_date?: string;
          location?: string | null;
          is_online?: boolean;
          price?: number;
          currency?: string;
          max_attendees?: number | null;
          image_url?: string | null;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string | null;
          seminar_id: string | null;
          status: 'active' | 'completed' | 'cancelled';
          enrolled_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id?: string | null;
          seminar_id?: string | null;
          status?: 'active' | 'completed' | 'cancelled';
          enrolled_at?: string;
          completed_at?: string | null;
        };
        Update: {
          user_id?: string;
          course_id?: string | null;
          seminar_id?: string | null;
          status?: 'active' | 'completed' | 'cancelled';
          completed_at?: string | null;
        };
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          category: string | null;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          category?: string | null;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          question?: string;
          answer?: string;
          category?: string | null;
          order_index?: number;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'editor';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'admin' | 'editor';
          created_at?: string;
        };
        Update: {
          role?: 'admin' | 'editor';
        };
      };
    };
  };
}
