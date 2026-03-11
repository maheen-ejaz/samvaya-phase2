export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      compatibility_profiles: {
        Row: {
          ai_compatibility_keywords: string[] | null
          ai_personality_summary: string | null
          ai_red_flags: string | null
          career_ambition_notes: string | null
          career_ambition_score: number | null
          closing_freeform_note: string | null
          communication_style:
            | Database["public"]["Enums"]["communication_style_enum"]
            | null
          conflict_approach:
            | Database["public"]["Enums"]["conflict_approach_enum"]
            | null
          conversation_completed_at: string | null
          created_at: string
          emotional_expressiveness_notes: string | null
          emotional_expressiveness_score: number | null
          extraction_model_version: string | null
          family_orientation_notes: string | null
          family_orientation_score: number | null
          financial_values:
            | Database["public"]["Enums"]["financial_values_enum"]
            | null
          id: string
          independence_vs_togetherness_notes: string | null
          independence_vs_togetherness_score: number | null
          input_mode: Database["public"]["Enums"]["input_mode_enum"] | null
          key_quote: string | null
          life_pace_notes: string | null
          life_pace_score: number | null
          partner_role_vision:
            | Database["public"]["Enums"]["partner_role_vision_enum"]
            | null
          raw_conversation_transcript: string | null
          relocation_openness_notes: string | null
          relocation_openness_score: number | null
          social_orientation_notes: string | null
          social_orientation_score: number | null
          traditionalism_notes: string | null
          traditionalism_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_compatibility_keywords?: string[] | null
          ai_personality_summary?: string | null
          ai_red_flags?: string | null
          career_ambition_notes?: string | null
          career_ambition_score?: number | null
          closing_freeform_note?: string | null
          communication_style?:
            | Database["public"]["Enums"]["communication_style_enum"]
            | null
          conflict_approach?:
            | Database["public"]["Enums"]["conflict_approach_enum"]
            | null
          conversation_completed_at?: string | null
          created_at?: string
          emotional_expressiveness_notes?: string | null
          emotional_expressiveness_score?: number | null
          extraction_model_version?: string | null
          family_orientation_notes?: string | null
          family_orientation_score?: number | null
          financial_values?:
            | Database["public"]["Enums"]["financial_values_enum"]
            | null
          id?: string
          independence_vs_togetherness_notes?: string | null
          independence_vs_togetherness_score?: number | null
          input_mode?: Database["public"]["Enums"]["input_mode_enum"] | null
          key_quote?: string | null
          life_pace_notes?: string | null
          life_pace_score?: number | null
          partner_role_vision?:
            | Database["public"]["Enums"]["partner_role_vision_enum"]
            | null
          raw_conversation_transcript?: string | null
          relocation_openness_notes?: string | null
          relocation_openness_score?: number | null
          social_orientation_notes?: string | null
          social_orientation_score?: number | null
          traditionalism_notes?: string | null
          traditionalism_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_compatibility_keywords?: string[] | null
          ai_personality_summary?: string | null
          ai_red_flags?: string | null
          career_ambition_notes?: string | null
          career_ambition_score?: number | null
          closing_freeform_note?: string | null
          communication_style?:
            | Database["public"]["Enums"]["communication_style_enum"]
            | null
          conflict_approach?:
            | Database["public"]["Enums"]["conflict_approach_enum"]
            | null
          conversation_completed_at?: string | null
          created_at?: string
          emotional_expressiveness_notes?: string | null
          emotional_expressiveness_score?: number | null
          extraction_model_version?: string | null
          family_orientation_notes?: string | null
          family_orientation_score?: number | null
          financial_values?:
            | Database["public"]["Enums"]["financial_values_enum"]
            | null
          id?: string
          independence_vs_togetherness_notes?: string | null
          independence_vs_togetherness_score?: number | null
          input_mode?: Database["public"]["Enums"]["input_mode_enum"] | null
          key_quote?: string | null
          life_pace_notes?: string | null
          life_pace_score?: number | null
          partner_role_vision?:
            | Database["public"]["Enums"]["partner_role_vision_enum"]
            | null
          raw_conversation_transcript?: string | null
          relocation_openness_notes?: string | null
          relocation_openness_score?: number | null
          social_orientation_notes?: string | null
          social_orientation_score?: number | null
          traditionalism_notes?: string | null
          traditionalism_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          document_type: Database["public"]["Enums"]["document_type_enum"]
          id: string
          rejection_reason: string | null
          storage_path: string
          updated_at: string
          uploaded_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["document_verification_status"]
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: Database["public"]["Enums"]["document_type_enum"]
          id?: string
          rejection_reason?: string | null
          storage_path: string
          updated_at?: string
          uploaded_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["document_verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type_enum"]
          id?: string
          rejection_reason?: string | null
          storage_path?: string
          updated_at?: string
          uploaded_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["document_verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_credentials: {
        Row: {
          additional_qualifications: string[] | null
          additional_qualifications_other: string | null
          created_at: string
          current_designation: string | null
          current_status:
            | Database["public"]["Enums"]["medical_status_enum"]
            | null
          has_work_experience: boolean | null
          id: string
          instagram_handle: string | null
          linkedin_url: string | null
          monthly_remuneration_range: string | null
          pg_plans: Database["public"]["Enums"]["pg_plans_enum"] | null
          specialty: string[] | null
          total_experience_months: number | null
          updated_at: string
          user_id: string
          work_experience: Json | null
        }
        Insert: {
          additional_qualifications?: string[] | null
          additional_qualifications_other?: string | null
          created_at?: string
          current_designation?: string | null
          current_status?:
            | Database["public"]["Enums"]["medical_status_enum"]
            | null
          has_work_experience?: boolean | null
          id?: string
          instagram_handle?: string | null
          linkedin_url?: string | null
          monthly_remuneration_range?: string | null
          pg_plans?: Database["public"]["Enums"]["pg_plans_enum"] | null
          specialty?: string[] | null
          total_experience_months?: number | null
          updated_at?: string
          user_id: string
          work_experience?: Json | null
        }
        Update: {
          additional_qualifications?: string[] | null
          additional_qualifications_other?: string | null
          created_at?: string
          current_designation?: string | null
          current_status?:
            | Database["public"]["Enums"]["medical_status_enum"]
            | null
          has_work_experience?: boolean | null
          id?: string
          instagram_handle?: string | null
          linkedin_url?: string | null
          monthly_remuneration_range?: string | null
          pg_plans?: Database["public"]["Enums"]["pg_plans_enum"] | null
          specialty?: string[] | null
          total_experience_months?: number | null
          updated_at?: string
          user_id?: string
          work_experience?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_preferences: {
        Row: {
          attire_preference:
            | Database["public"]["Enums"]["attire_preference_enum"]
            | null
          body_type_preference: string[] | null
          created_at: string
          diet_preference: string[] | null
          drinking_preference:
            | Database["public"]["Enums"]["drinking_preference_enum"]
            | null
          family_type_preference:
            | Database["public"]["Enums"]["family_arrangement_enum"]
            | null
          fitness_preference:
            | Database["public"]["Enums"]["fitness_preference_enum"]
            | null
          id: string
          no_location_preference: boolean | null
          partner_career_expectation_after_marriage:
            | Database["public"]["Enums"]["partner_career_expectation_enum"]
            | null
          partner_qualities: string[] | null
          partner_qualities_other: string | null
          preferred_age_max: number | null
          preferred_age_min: number | null
          preferred_career_stage: string[] | null
          preferred_countries: string[] | null
          preferred_height_max_cm: number | null
          preferred_height_min_cm: number | null
          preferred_indian_states: string[] | null
          preferred_mother_tongue: string[] | null
          preferred_specialties: string[] | null
          prefers_specific_specialty: boolean | null
          religious_observance_preference:
            | Database["public"]["Enums"]["religious_observance_preference_enum"]
            | null
          smoking_preference:
            | Database["public"]["Enums"]["smoking_preference_enum"]
            | null
          tattoo_preference:
            | Database["public"]["Enums"]["tattoo_preference_enum"]
            | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attire_preference?:
            | Database["public"]["Enums"]["attire_preference_enum"]
            | null
          body_type_preference?: string[] | null
          created_at?: string
          diet_preference?: string[] | null
          drinking_preference?:
            | Database["public"]["Enums"]["drinking_preference_enum"]
            | null
          family_type_preference?:
            | Database["public"]["Enums"]["family_arrangement_enum"]
            | null
          fitness_preference?:
            | Database["public"]["Enums"]["fitness_preference_enum"]
            | null
          id?: string
          no_location_preference?: boolean | null
          partner_career_expectation_after_marriage?:
            | Database["public"]["Enums"]["partner_career_expectation_enum"]
            | null
          partner_qualities?: string[] | null
          partner_qualities_other?: string | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          preferred_career_stage?: string[] | null
          preferred_countries?: string[] | null
          preferred_height_max_cm?: number | null
          preferred_height_min_cm?: number | null
          preferred_indian_states?: string[] | null
          preferred_mother_tongue?: string[] | null
          preferred_specialties?: string[] | null
          prefers_specific_specialty?: boolean | null
          religious_observance_preference?:
            | Database["public"]["Enums"]["religious_observance_preference_enum"]
            | null
          smoking_preference?:
            | Database["public"]["Enums"]["smoking_preference_enum"]
            | null
          tattoo_preference?:
            | Database["public"]["Enums"]["tattoo_preference_enum"]
            | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attire_preference?:
            | Database["public"]["Enums"]["attire_preference_enum"]
            | null
          body_type_preference?: string[] | null
          created_at?: string
          diet_preference?: string[] | null
          drinking_preference?:
            | Database["public"]["Enums"]["drinking_preference_enum"]
            | null
          family_type_preference?:
            | Database["public"]["Enums"]["family_arrangement_enum"]
            | null
          fitness_preference?:
            | Database["public"]["Enums"]["fitness_preference_enum"]
            | null
          id?: string
          no_location_preference?: boolean | null
          partner_career_expectation_after_marriage?:
            | Database["public"]["Enums"]["partner_career_expectation_enum"]
            | null
          partner_qualities?: string[] | null
          partner_qualities_other?: string | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          preferred_career_stage?: string[] | null
          preferred_countries?: string[] | null
          preferred_height_max_cm?: number | null
          preferred_height_min_cm?: number | null
          preferred_indian_states?: string[] | null
          preferred_mother_tongue?: string[] | null
          preferred_specialties?: string[] | null
          prefers_specific_specialty?: boolean | null
          religious_observance_preference?:
            | Database["public"]["Enums"]["religious_observance_preference_enum"]
            | null
          smoking_preference?:
            | Database["public"]["Enums"]["smoking_preference_enum"]
            | null
          tattoo_preference?:
            | Database["public"]["Enums"]["tattoo_preference_enum"]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string
          currency: string
          id: string
          is_goocampus_member: boolean
          match_presentation_id: string | null
          membership_expiry_date: string | null
          membership_start_date: string | null
          paid_at: string | null
          payment_type: Database["public"]["Enums"]["payment_type_enum"]
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          refund_reason: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_transaction_status"]
          updated_at: string
          user_id: string
          verification_fee_paid: boolean
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string
          id?: string
          is_goocampus_member?: boolean
          match_presentation_id?: string | null
          membership_expiry_date?: string | null
          membership_start_date?: string | null
          paid_at?: string | null
          payment_type: Database["public"]["Enums"]["payment_type_enum"]
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_transaction_status"]
          updated_at?: string
          user_id: string
          verification_fee_paid?: boolean
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string
          id?: string
          is_goocampus_member?: boolean
          match_presentation_id?: string | null
          membership_expiry_date?: string | null
          membership_start_date?: string | null
          paid_at?: string | null
          payment_type?: Database["public"]["Enums"]["payment_type_enum"]
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_transaction_status"]
          updated_at?: string
          user_id?: string
          verification_fee_paid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          blurred_path: string | null
          created_at: string
          display_order: number
          id: string
          is_primary: boolean
          storage_path: string
          updated_at: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          blurred_path?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          storage_path: string
          updated_at?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          blurred_path?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          storage_path?: string
          updated_at?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          abroad_countries: string[] | null
          allergy_description: string | null
          attire_preference:
            | Database["public"]["Enums"]["attire_preference_enum"]
            | null
          believes_in_kundali: boolean | null
          blood_group: string | null
          both_partners_working_expectation:
            | Database["public"]["Enums"]["working_expectation_enum"]
            | null
          caste: string | null
          caste_comfort: boolean | null
          children_count_preference:
            | Database["public"]["Enums"]["children_count_enum"]
            | null
          children_timing_preference:
            | Database["public"]["Enums"]["children_timing_enum"]
            | null
          citizenship_country: string | null
          city_of_birth: string | null
          created_at: string
          current_city: string | null
          current_country: string | null
          current_state: string | null
          date_of_birth: string | null
          diet: Database["public"]["Enums"]["diet_enum"] | null
          disability_description: string | null
          drinking: Database["public"]["Enums"]["drinking_enum"] | null
          employment_visa_country: string | null
          father_name: string | null
          father_occupation: string | null
          first_name: string | null
          fitness_habits:
            | Database["public"]["Enums"]["fitness_habits_enum"]
            | null
          gender: Database["public"]["Enums"]["gender_enum"] | null
          has_allergies: boolean | null
          has_children_from_previous: boolean | null
          has_disability: Database["public"]["Enums"]["disability_enum"] | null
          height_cm: number | null
          hobbies_interests: string[] | null
          hobbies_regular: string | null
          id: string
          languages_spoken: string[] | null
          last_name: string | null
          long_distance_comfort:
            | Database["public"]["Enums"]["long_distance_enum"]
            | null
          marital_status:
            | Database["public"]["Enums"]["marital_status_enum"]
            | null
          marriage_timeline:
            | Database["public"]["Enums"]["marriage_timeline_enum"]
            | null
          mother_name: string | null
          mother_occupation: string | null
          mother_tongue: string | null
          open_to_immediate_relocation:
            | Database["public"]["Enums"]["relocation_openness_enum"]
            | null
          open_to_partner_with_children:
            | Database["public"]["Enums"]["wants_children_enum"]
            | null
          permanent_city: string | null
          permanent_ownership:
            | Database["public"]["Enums"]["permanent_ownership_enum"]
            | null
          place_of_birth: string | null
          plans_to_go_abroad: boolean | null
          post_marriage_family_arrangement:
            | Database["public"]["Enums"]["family_arrangement_enum"]
            | null
          preferred_settlement_countries: string[] | null
          referral_source:
            | Database["public"]["Enums"]["referral_source_enum"]
            | null
          religion: string | null
          religious_observance:
            | Database["public"]["Enums"]["religious_observance_enum"]
            | null
          siblings_count: number | null
          skin_tone: string | null
          smoking: Database["public"]["Enums"]["smoking_enum"] | null
          tattoos_piercings:
            | Database["public"]["Enums"]["tattoos_piercings_enum"]
            | null
          time_of_birth: string | null
          updated_at: string
          user_id: string
          wants_children:
            | Database["public"]["Enums"]["wants_children_enum"]
            | null
          weight_kg: number | null
        }
        Insert: {
          abroad_countries?: string[] | null
          allergy_description?: string | null
          attire_preference?:
            | Database["public"]["Enums"]["attire_preference_enum"]
            | null
          believes_in_kundali?: boolean | null
          blood_group?: string | null
          both_partners_working_expectation?:
            | Database["public"]["Enums"]["working_expectation_enum"]
            | null
          caste?: string | null
          caste_comfort?: boolean | null
          children_count_preference?:
            | Database["public"]["Enums"]["children_count_enum"]
            | null
          children_timing_preference?:
            | Database["public"]["Enums"]["children_timing_enum"]
            | null
          citizenship_country?: string | null
          city_of_birth?: string | null
          created_at?: string
          current_city?: string | null
          current_country?: string | null
          current_state?: string | null
          date_of_birth?: string | null
          diet?: Database["public"]["Enums"]["diet_enum"] | null
          disability_description?: string | null
          drinking?: Database["public"]["Enums"]["drinking_enum"] | null
          employment_visa_country?: string | null
          father_name?: string | null
          father_occupation?: string | null
          first_name?: string | null
          fitness_habits?:
            | Database["public"]["Enums"]["fitness_habits_enum"]
            | null
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          has_allergies?: boolean | null
          has_children_from_previous?: boolean | null
          has_disability?: Database["public"]["Enums"]["disability_enum"] | null
          height_cm?: number | null
          hobbies_interests?: string[] | null
          hobbies_regular?: string | null
          id?: string
          languages_spoken?: string[] | null
          last_name?: string | null
          long_distance_comfort?:
            | Database["public"]["Enums"]["long_distance_enum"]
            | null
          marital_status?:
            | Database["public"]["Enums"]["marital_status_enum"]
            | null
          marriage_timeline?:
            | Database["public"]["Enums"]["marriage_timeline_enum"]
            | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_tongue?: string | null
          open_to_immediate_relocation?:
            | Database["public"]["Enums"]["relocation_openness_enum"]
            | null
          open_to_partner_with_children?:
            | Database["public"]["Enums"]["wants_children_enum"]
            | null
          permanent_city?: string | null
          permanent_ownership?:
            | Database["public"]["Enums"]["permanent_ownership_enum"]
            | null
          place_of_birth?: string | null
          plans_to_go_abroad?: boolean | null
          post_marriage_family_arrangement?:
            | Database["public"]["Enums"]["family_arrangement_enum"]
            | null
          preferred_settlement_countries?: string[] | null
          referral_source?:
            | Database["public"]["Enums"]["referral_source_enum"]
            | null
          religion?: string | null
          religious_observance?:
            | Database["public"]["Enums"]["religious_observance_enum"]
            | null
          siblings_count?: number | null
          skin_tone?: string | null
          smoking?: Database["public"]["Enums"]["smoking_enum"] | null
          tattoos_piercings?:
            | Database["public"]["Enums"]["tattoos_piercings_enum"]
            | null
          time_of_birth?: string | null
          updated_at?: string
          user_id: string
          wants_children?:
            | Database["public"]["Enums"]["wants_children_enum"]
            | null
          weight_kg?: number | null
        }
        Update: {
          abroad_countries?: string[] | null
          allergy_description?: string | null
          attire_preference?:
            | Database["public"]["Enums"]["attire_preference_enum"]
            | null
          believes_in_kundali?: boolean | null
          blood_group?: string | null
          both_partners_working_expectation?:
            | Database["public"]["Enums"]["working_expectation_enum"]
            | null
          caste?: string | null
          caste_comfort?: boolean | null
          children_count_preference?:
            | Database["public"]["Enums"]["children_count_enum"]
            | null
          children_timing_preference?:
            | Database["public"]["Enums"]["children_timing_enum"]
            | null
          citizenship_country?: string | null
          city_of_birth?: string | null
          created_at?: string
          current_city?: string | null
          current_country?: string | null
          current_state?: string | null
          date_of_birth?: string | null
          diet?: Database["public"]["Enums"]["diet_enum"] | null
          disability_description?: string | null
          drinking?: Database["public"]["Enums"]["drinking_enum"] | null
          employment_visa_country?: string | null
          father_name?: string | null
          father_occupation?: string | null
          first_name?: string | null
          fitness_habits?:
            | Database["public"]["Enums"]["fitness_habits_enum"]
            | null
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          has_allergies?: boolean | null
          has_children_from_previous?: boolean | null
          has_disability?: Database["public"]["Enums"]["disability_enum"] | null
          height_cm?: number | null
          hobbies_interests?: string[] | null
          hobbies_regular?: string | null
          id?: string
          languages_spoken?: string[] | null
          last_name?: string | null
          long_distance_comfort?:
            | Database["public"]["Enums"]["long_distance_enum"]
            | null
          marital_status?:
            | Database["public"]["Enums"]["marital_status_enum"]
            | null
          marriage_timeline?:
            | Database["public"]["Enums"]["marriage_timeline_enum"]
            | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_tongue?: string | null
          open_to_immediate_relocation?:
            | Database["public"]["Enums"]["relocation_openness_enum"]
            | null
          open_to_partner_with_children?:
            | Database["public"]["Enums"]["wants_children_enum"]
            | null
          permanent_city?: string | null
          permanent_ownership?:
            | Database["public"]["Enums"]["permanent_ownership_enum"]
            | null
          place_of_birth?: string | null
          plans_to_go_abroad?: boolean | null
          post_marriage_family_arrangement?:
            | Database["public"]["Enums"]["family_arrangement_enum"]
            | null
          preferred_settlement_countries?: string[] | null
          referral_source?:
            | Database["public"]["Enums"]["referral_source_enum"]
            | null
          religion?: string | null
          religious_observance?:
            | Database["public"]["Enums"]["religious_observance_enum"]
            | null
          siblings_count?: number | null
          skin_tone?: string | null
          smoking?: Database["public"]["Enums"]["smoking_enum"] | null
          tattoos_piercings?:
            | Database["public"]["Enums"]["tattoos_piercings_enum"]
            | null
          time_of_birth?: string | null
          updated_at?: string
          user_id?: string
          wants_children?:
            | Database["public"]["Enums"]["wants_children_enum"]
            | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          ai_conversation_status: Database["public"]["Enums"]["ai_conversation_status_enum"]
          bgv_consent: Database["public"]["Enums"]["bgv_consent_enum"]
          bgv_flagged: boolean
          created_at: string
          id: string
          is_bgv_complete: boolean
          is_goocampus_member: boolean
          membership_status: Database["public"]["Enums"]["membership_status_enum"]
          membership_tier: Database["public"]["Enums"]["membership_tier_enum"]
          onboarding_last_question: number
          onboarding_section: number
          payment_status: Database["public"]["Enums"]["user_payment_status"]
          profile_completion_pct: number
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          verified_at: string | null
          waitlist_id: string | null
        }
        Insert: {
          ai_conversation_status?: Database["public"]["Enums"]["ai_conversation_status_enum"]
          bgv_consent?: Database["public"]["Enums"]["bgv_consent_enum"]
          bgv_flagged?: boolean
          created_at?: string
          id: string
          is_bgv_complete?: boolean
          is_goocampus_member?: boolean
          membership_status?: Database["public"]["Enums"]["membership_status_enum"]
          membership_tier?: Database["public"]["Enums"]["membership_tier_enum"]
          onboarding_last_question?: number
          onboarding_section?: number
          payment_status?: Database["public"]["Enums"]["user_payment_status"]
          profile_completion_pct?: number
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          verified_at?: string | null
          waitlist_id?: string | null
        }
        Update: {
          ai_conversation_status?: Database["public"]["Enums"]["ai_conversation_status_enum"]
          bgv_consent?: Database["public"]["Enums"]["bgv_consent_enum"]
          bgv_flagged?: boolean
          created_at?: string
          id?: string
          is_bgv_complete?: boolean
          is_goocampus_member?: boolean
          membership_status?: Database["public"]["Enums"]["membership_status_enum"]
          membership_tier?: Database["public"]["Enums"]["membership_tier_enum"]
          onboarding_last_question?: number
          onboarding_section?: number
          payment_status?: Database["public"]["Enums"]["user_payment_status"]
          profile_completion_pct?: number
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          verified_at?: string | null
          waitlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_waitlist_id_fkey"
            columns: ["waitlist_id"]
            isOneToOne: false
            referencedRelation: "waitlist"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          career_stage: Database["public"]["Enums"]["career_stage_enum"] | null
          city: string | null
          converted_at: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          invited_at: string | null
          phone: string | null
          specialty: string | null
          status: Database["public"]["Enums"]["waitlist_status"] | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          career_stage?: Database["public"]["Enums"]["career_stage_enum"] | null
          city?: string | null
          converted_at?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          invited_at?: string | null
          phone?: string | null
          specialty?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"] | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          career_stage?: Database["public"]["Enums"]["career_stage_enum"] | null
          city?: string | null
          converted_at?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          invited_at?: string | null
          phone?: string | null
          specialty?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"] | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      ai_conversation_status_enum:
        | "not_started"
        | "conv1_in_progress"
        | "conv1_complete"
        | "conv2_in_progress"
        | "conv2_complete"
        | "conv3_in_progress"
        | "all_complete"
      attire_preference_enum:
        | "modern_western"
        | "traditional"
        | "mix"
        | "no_preference"
      bgv_consent_enum:
        | "not_given"
        | "consented"
        | "consented_wants_call"
        | "refused"
      career_stage_enum:
        | "student"
        | "resident"
        | "junior_doctor"
        | "consultant"
        | "specialist"
      children_count_enum: "1" | "2" | "3_or_more" | "no_preference"
      children_timing_enum:
        | "within_1_2_years"
        | "after_3_5_years"
        | "after_milestones"
        | "no_preference"
      communication_style_enum:
        | "direct"
        | "indirect"
        | "avoidant"
        | "expressive"
        | "reserved"
      conflict_approach_enum:
        | "addresses_immediately"
        | "reflects_first"
        | "withdraws"
        | "collaborative"
      diet_enum:
        | "vegetarian"
        | "non_vegetarian"
        | "eggetarian"
        | "vegan"
        | "jain"
        | "other"
      disability_enum: "yes" | "no" | "prefer_not_to_disclose"
      document_type_enum: "identity_document" | "kundali" | "other"
      document_verification_status:
        | "pending"
        | "verified"
        | "rejected"
        | "needs_resubmission"
      drinking_enum: "never" | "occasionally" | "frequently"
      drinking_preference_enum:
        | "never"
        | "occasionally"
        | "frequently"
        | "no_preference"
      family_arrangement_enum:
        | "nuclear"
        | "joint"
        | "flexible"
        | "no_preference"
      financial_values_enum:
        | "financially_intentional"
        | "financially_casual"
        | "financially_anxious"
        | "not_discussed"
      fitness_habits_enum:
        | "regularly_exercises"
        | "occasionally"
        | "rarely"
        | "not_interested"
      fitness_preference_enum:
        | "regularly_exercises"
        | "occasionally"
        | "rarely"
        | "no_preference"
      gender_enum: "male" | "female"
      input_mode_enum: "text" | "voice"
      long_distance_enum:
        | "yes_absolutely"
        | "open_to_it"
        | "prefer_same_location"
      marital_status_enum: "first_marriage" | "divorced" | "widowed"
      marriage_timeline_enum:
        | "within_6_months"
        | "6_to_12_months"
        | "1_to_2_years"
        | "no_fixed_timeline"
      medical_status_enum:
        | "mbbs_student"
        | "intern"
        | "mbbs_passed"
        | "pursuing_pg"
        | "completed_pg"
      membership_status_enum:
        | "onboarding_pending"
        | "onboarding_in_progress"
        | "onboarding_complete"
        | "active"
        | "paused"
        | "suspended"
        | "deleted"
      membership_tier_enum: "standard" | "premium_concierge"
      partner_career_expectation_enum:
        | "both_continue"
        | "comfortable_either_way"
        | "prefer_partner_home"
        | "open"
      partner_role_vision_enum: "co_builder" | "anchor_complement" | "flexible"
      payment_transaction_status:
        | "created"
        | "authorized"
        | "captured"
        | "failed"
        | "refunded"
      payment_type_enum:
        | "verification_fee"
        | "membership_fee"
        | "membership_renewal"
      permanent_ownership_enum: "owned" | "rented" | "family_home"
      pg_plans_enum:
        | "yes_within_1_year"
        | "yes_2_to_3_years"
        | "no_plan_to_practice"
        | "undecided"
      referral_source_enum:
        | "instagram"
        | "linkedin"
        | "friend"
        | "goocampus"
        | "google"
        | "other"
      religious_observance_enum:
        | "actively_practicing"
        | "culturally_observant"
        | "spiritual"
        | "not_religious"
      religious_observance_preference_enum:
        | "actively_practicing"
        | "culturally_observant"
        | "spiritual"
        | "not_religious"
        | "no_preference"
      relocation_openness_enum: "yes" | "no" | "open"
      smoking_enum: "never" | "occasionally" | "frequently"
      smoking_preference_enum:
        | "never"
        | "occasionally"
        | "frequently"
        | "no_preference"
      tattoo_preference_enum:
        | "none"
        | "tattoos_only"
        | "piercings_only"
        | "both"
        | "no_preference"
      tattoos_piercings_enum:
        | "none"
        | "tattoos_only"
        | "piercings_only"
        | "both"
      user_payment_status:
        | "unverified"
        | "verification_pending"
        | "in_pool"
        | "match_presented"
        | "awaiting_payment"
        | "active_member"
        | "membership_expired"
      user_role: "applicant" | "admin" | "super_admin"
      waitlist_status: "pending" | "invited" | "converted" | "rejected"
      wants_children_enum: "yes" | "no" | "open"
      working_expectation_enum:
        | "both_continue"
        | "comfortable_either_way"
        | "i_prefer_home"
        | "prefer_partner_home"
        | "open"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ai_conversation_status_enum: [
        "not_started",
        "conv1_in_progress",
        "conv1_complete",
        "conv2_in_progress",
        "conv2_complete",
        "conv3_in_progress",
        "all_complete",
      ],
      attire_preference_enum: [
        "modern_western",
        "traditional",
        "mix",
        "no_preference",
      ],
      bgv_consent_enum: [
        "not_given",
        "consented",
        "consented_wants_call",
        "refused",
      ],
      career_stage_enum: [
        "student",
        "resident",
        "junior_doctor",
        "consultant",
        "specialist",
      ],
      children_count_enum: ["1", "2", "3_or_more", "no_preference"],
      children_timing_enum: [
        "within_1_2_years",
        "after_3_5_years",
        "after_milestones",
        "no_preference",
      ],
      communication_style_enum: [
        "direct",
        "indirect",
        "avoidant",
        "expressive",
        "reserved",
      ],
      conflict_approach_enum: [
        "addresses_immediately",
        "reflects_first",
        "withdraws",
        "collaborative",
      ],
      diet_enum: [
        "vegetarian",
        "non_vegetarian",
        "eggetarian",
        "vegan",
        "jain",
        "other",
      ],
      disability_enum: ["yes", "no", "prefer_not_to_disclose"],
      document_type_enum: ["identity_document", "kundali", "other"],
      document_verification_status: [
        "pending",
        "verified",
        "rejected",
        "needs_resubmission",
      ],
      drinking_enum: ["never", "occasionally", "frequently"],
      drinking_preference_enum: [
        "never",
        "occasionally",
        "frequently",
        "no_preference",
      ],
      family_arrangement_enum: [
        "nuclear",
        "joint",
        "flexible",
        "no_preference",
      ],
      financial_values_enum: [
        "financially_intentional",
        "financially_casual",
        "financially_anxious",
        "not_discussed",
      ],
      fitness_habits_enum: [
        "regularly_exercises",
        "occasionally",
        "rarely",
        "not_interested",
      ],
      fitness_preference_enum: [
        "regularly_exercises",
        "occasionally",
        "rarely",
        "no_preference",
      ],
      gender_enum: ["male", "female"],
      input_mode_enum: ["text", "voice"],
      long_distance_enum: [
        "yes_absolutely",
        "open_to_it",
        "prefer_same_location",
      ],
      marital_status_enum: ["first_marriage", "divorced", "widowed"],
      marriage_timeline_enum: [
        "within_6_months",
        "6_to_12_months",
        "1_to_2_years",
        "no_fixed_timeline",
      ],
      medical_status_enum: [
        "mbbs_student",
        "intern",
        "mbbs_passed",
        "pursuing_pg",
        "completed_pg",
      ],
      membership_status_enum: [
        "onboarding_pending",
        "onboarding_in_progress",
        "onboarding_complete",
        "active",
        "paused",
        "suspended",
        "deleted",
      ],
      membership_tier_enum: ["standard", "premium_concierge"],
      partner_career_expectation_enum: [
        "both_continue",
        "comfortable_either_way",
        "prefer_partner_home",
        "open",
      ],
      partner_role_vision_enum: ["co_builder", "anchor_complement", "flexible"],
      payment_transaction_status: [
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded",
      ],
      payment_type_enum: [
        "verification_fee",
        "membership_fee",
        "membership_renewal",
      ],
      permanent_ownership_enum: ["owned", "rented", "family_home"],
      pg_plans_enum: [
        "yes_within_1_year",
        "yes_2_to_3_years",
        "no_plan_to_practice",
        "undecided",
      ],
      referral_source_enum: [
        "instagram",
        "linkedin",
        "friend",
        "goocampus",
        "google",
        "other",
      ],
      religious_observance_enum: [
        "actively_practicing",
        "culturally_observant",
        "spiritual",
        "not_religious",
      ],
      religious_observance_preference_enum: [
        "actively_practicing",
        "culturally_observant",
        "spiritual",
        "not_religious",
        "no_preference",
      ],
      relocation_openness_enum: ["yes", "no", "open"],
      smoking_enum: ["never", "occasionally", "frequently"],
      smoking_preference_enum: [
        "never",
        "occasionally",
        "frequently",
        "no_preference",
      ],
      tattoo_preference_enum: [
        "none",
        "tattoos_only",
        "piercings_only",
        "both",
        "no_preference",
      ],
      tattoos_piercings_enum: [
        "none",
        "tattoos_only",
        "piercings_only",
        "both",
      ],
      user_payment_status: [
        "unverified",
        "verification_pending",
        "in_pool",
        "match_presented",
        "awaiting_payment",
        "active_member",
        "membership_expired",
      ],
      user_role: ["applicant", "admin", "super_admin"],
      waitlist_status: ["pending", "invited", "converted", "rejected"],
      wants_children_enum: ["yes", "no", "open"],
      working_expectation_enum: [
        "both_continue",
        "comfortable_either_way",
        "i_prefer_home",
        "prefer_partner_home",
        "open",
      ],
    },
  },
} as const
