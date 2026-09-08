/**
 * Database type definitions, mirroring supabase/migrations/0001_init.sql.
 *
 * Keep these in sync with the SQL schema. These power the typed client
 * in lib/supabase.ts. (Alternatively run `supabase gen types` to regenerate.)
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      site_content: {
        Row: {
          id: string;
          key: string;
          title: string | null;
          body: string | null;
          extra: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          title?: string | null;
          body?: string | null;
          extra?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          title?: string | null;
          body?: string | null;
          extra?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      packages: {
        Row: {
          id: string;
          niche: string;
          tier:
            | "Starter"
            | "Standard"
            | "Premium"
            | "brochure"
            | "cms"
            | "ecommerce";
          name: string;
          price_min: number | null;
          price_max: number | null;
          price_usd_min: number | null;
          price_usd_max: number | null;
          features: Json | null;
          timeline: string | null;
          stack: string | null;
          popular: boolean;
          sort: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          niche: string;
          tier:
            | "Starter"
            | "Standard"
            | "Premium"
            | "brochure"
            | "cms"
            | "ecommerce";
          name: string;
          price_min?: number | null;
          price_max?: number | null;
          price_usd_min?: number | null;
          price_usd_max?: number | null;
          features?: Json | null;
          timeline?: string | null;
          stack?: string | null;
          popular?: boolean;
          sort?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          niche?: string;
          tier?:
            | "Starter"
            | "Standard"
            | "Premium"
            | "brochure"
            | "cms"
            | "ecommerce";
          name?: string;
          price_min?: number | null;
          price_max?: number | null;
          price_usd_min?: number | null;
          price_usd_max?: number | null;
          features?: Json | null;
          timeline?: string | null;
          stack?: string | null;
          popular?: boolean;
          sort?: number;
          created_at?: string;
        };
      };
      case_studies: {
        Row: {
          id: string;
          niche: string;
          title: string;
          slug: string;
          summary: string;
          problem: string | null;
          solution: string | null;
          result: string | null;
          preview_url: string | null;
          video_url: string | null;
          image_urls: Json | null;
          before_after: Json | null;
          excerpt: string | null;
          published: boolean;
          sort: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          niche: string;
          title: string;
          slug: string;
          summary?: string;
          problem?: string | null;
          solution?: string | null;
          result?: string | null;
          preview_url?: string | null;
          video_url?: string | null;
          image_urls?: Json | null;
          before_after?: Json | null;
          excerpt?: string | null;
          published?: boolean;
          sort?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          niche?: string;
          title?: string;
          slug?: string;
          summary?: string;
          problem?: string | null;
          solution?: string | null;
          result?: string | null;
          preview_url?: string | null;
          video_url?: string | null;
          image_urls?: Json | null;
          before_after?: Json | null;
          excerpt?: string | null;
          published?: boolean;
          sort?: number;
          created_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          quote: string;
          name: string;
          role: string | null;
          niche: string | null;
          sort: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote: string;
          name: string;
          role?: string | null;
          niche?: string | null;
          sort?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quote?: string;
          name?: string;
          role?: string | null;
          niche?: string | null;
          sort?: number;
          created_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          created_at: string;
          status: string;
          name: string | null;
          email: string | null;
          whatsapp: string | null;
          niche: string | null;
          tier: string | null;
          scope: string | null;
          source: string | null;
          deposit_paid: boolean;
          final_paid: boolean;
          preview_url: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          status?: string;
          name?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          niche?: string | null;
          tier?: string | null;
          scope?: string | null;
          source?: string | null;
          deposit_paid?: boolean;
          final_paid?: boolean;
          preview_url?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          status?: string;
          name?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          niche?: string | null;
          tier?: string | null;
          scope?: string | null;
          source?: string | null;
          deposit_paid?: boolean;
          final_paid?: boolean;
          preview_url?: string | null;
          notes?: string | null;
        };
      };
      lead_events: {
        Row: {
          id: string;
          lead_id: string;
          stage: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          stage: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          stage?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
