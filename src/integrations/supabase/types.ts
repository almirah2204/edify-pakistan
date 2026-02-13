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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          class_id: string | null
          created_at: string | null
          date: string
          id: string
          marked_by: string | null
          remarks: string | null
          status: string
          student_id: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          marked_by?: string | null
          remarks?: string | null
          status: string
          student_id: string
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          marked_by?: string | null
          remarks?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string | null
          created_at: string | null
          grade_level: number | null
          id: string
          name: string
          section: string | null
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          created_at?: string | null
          grade_level?: number | null
          id?: string
          name: string
          section?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          created_at?: string | null
          grade_level?: number | null
          id?: string
          name?: string
          section?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          address: string | null
          assigned_to: string | null
          class_applied: string | null
          contact_number: string | null
          created_at: string | null
          email: string | null
          enquiry_date: string
          father_name: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          previous_school: string | null
          source: string | null
          status: string | null
          student_name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          class_applied?: string | null
          contact_number?: string | null
          created_at?: string | null
          email?: string | null
          enquiry_date?: string
          father_name?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          previous_school?: string | null
          source?: string | null
          status?: string | null
          student_name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          class_applied?: string | null
          contact_number?: string | null
          created_at?: string | null
          email?: string | null
          enquiry_date?: string
          father_name?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          previous_school?: string | null
          source?: string | null
          status?: string | null
          student_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          class_id: string | null
          created_at: string | null
          exam_date: string | null
          exam_type: string | null
          id: string
          name: string
          passing_marks: number | null
          subject: string | null
          total_marks: number | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          exam_date?: string | null
          exam_type?: string | null
          id?: string
          name: string
          passing_marks?: number | null
          subject?: string | null
          total_marks?: number | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          exam_date?: string | null
          exam_type?: string | null
          id?: string
          name?: string
          passing_marks?: number | null
          subject?: string | null
          total_marks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_invoices: {
        Row: {
          amount_paid: number | null
          arrears: number | null
          balance: number | null
          base_amount: number
          created_at: string | null
          discount: number | null
          due_date: string
          id: string
          late_fine: number | null
          month_year: string
          notes: string | null
          pdf_url: string | null
          status: string | null
          student_id: string
          total_due: number
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          arrears?: number | null
          balance?: number | null
          base_amount?: number
          created_at?: string | null
          discount?: number | null
          due_date: string
          id?: string
          late_fine?: number | null
          month_year: string
          notes?: string | null
          pdf_url?: string | null
          status?: string | null
          student_id: string
          total_due: number
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          arrears?: number | null
          balance?: number | null
          base_amount?: number
          created_at?: string | null
          discount?: number | null
          due_date?: string
          id?: string
          late_fine?: number | null
          month_year?: string
          notes?: string | null
          pdf_url?: string | null
          status?: string | null
          student_id?: string
          total_due?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_mode: string
          received_by: string | null
          reference_number: string | null
          student_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_mode: string
          received_by?: string | null
          reference_number?: string | null
          student_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string
          received_by?: string | null
          reference_number?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "fee_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          amount: number
          applicable_classes: Json | null
          class_id: string | null
          created_at: string | null
          description: string | null
          fee_category: string | null
          frequency: string | null
          id: string
          name: string
        }
        Insert: {
          amount: number
          applicable_classes?: Json | null
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          fee_category?: string | null
          frequency?: string | null
          id?: string
          name: string
        }
        Update: {
          amount?: number
          applicable_classes?: Json | null
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          fee_category?: string | null
          frequency?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      fees: {
        Row: {
          amount_due: number
          amount_paid: number | null
          created_at: string | null
          due_date: string
          fee_structure_id: string | null
          id: string
          paid_date: string | null
          payment_method: string | null
          receipt_url: string | null
          status: string | null
          student_id: string
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          created_at?: string | null
          due_date: string
          fee_structure_id?: string | null
          id?: string
          paid_date?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          status?: string | null
          student_id: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          created_at?: string | null
          due_date?: string
          fee_structure_id?: string | null
          id?: string
          paid_date?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fees_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          attachment_url: string | null
          class_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          subject: string
          teacher_id: string | null
          title: string
        }
        Insert: {
          attachment_url?: string | null
          class_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          subject: string
          teacher_id?: string | null
          title: string
        }
        Update: {
          attachment_url?: string | null
          class_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          subject?: string
          teacher_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_by: string | null
          created_at: string | null
          end_date: string
          id: string
          leave_type: string | null
          reason: string | null
          start_date: string
          status: string | null
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          leave_type?: string | null
          reason?: string | null
          start_date: string
          status?: string | null
          user_id: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          leave_type?: string | null
          reason?: string | null
          start_date?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          target_class_id: string | null
          target_role: Database["public"]["Enums"]["app_role"] | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          target_class_id?: string | null
          target_role?: Database["public"]["Enums"]["app_role"] | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          target_class_id?: string | null
          target_role?: Database["public"]["Enums"]["app_role"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_target_class_id_fkey"
            columns: ["target_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          address: string | null
          created_at: string | null
          emergency_contact: string | null
          id: string
          occupation: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          emergency_contact?: string | null
          id: string
          occupation?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          emergency_contact?: string | null
          id?: string
          occupation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parents_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_approved: boolean | null
          language_pref: string | null
          phone: string | null
          school_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
          is_approved?: boolean | null
          language_pref?: string | null
          phone?: string | null
          school_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_approved?: boolean | null
          language_pref?: string | null
          phone?: string | null
          school_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          created_at: string | null
          entered_by: string | null
          exam_id: string
          grade: string | null
          id: string
          marks_obtained: number | null
          marksheet_url: string | null
          remarks: string | null
          student_id: string
        }
        Insert: {
          created_at?: string | null
          entered_by?: string | null
          exam_id: string
          grade?: string | null
          id?: string
          marks_obtained?: number | null
          marksheet_url?: string | null
          remarks?: string | null
          student_id: string
        }
        Update: {
          created_at?: string | null
          entered_by?: string | null
          exam_id?: string
          grade?: string | null
          id?: string
          marks_obtained?: number | null
          marksheet_url?: string | null
          remarks?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      salaries: {
        Row: {
          base_salary: number
          bonuses: number | null
          created_at: string | null
          deductions: number | null
          id: string
          month: string
          net_salary: number
          paid_date: string | null
          slip_url: string | null
          status: string | null
          teacher_id: string
        }
        Insert: {
          base_salary: number
          bonuses?: number | null
          created_at?: string | null
          deductions?: number | null
          id?: string
          month: string
          net_salary: number
          paid_date?: string | null
          slip_url?: string | null
          status?: string | null
          teacher_id: string
        }
        Update: {
          base_salary?: number
          bonuses?: number | null
          created_at?: string | null
          deductions?: number | null
          id?: string
          month?: string
          net_salary?: number
          paid_date?: string | null
          slip_url?: string | null
          status?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salaries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          academic_year: string | null
          address: string | null
          city: string | null
          code: string
          created_at: string | null
          currency: string | null
          domain: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_staff: number | null
          max_students: number | null
          name: string
          phone: string | null
          primary_color: string | null
          principal_name: string | null
          secondary_color: string | null
          subscription_end: string | null
          subscription_plan: string | null
          subscription_start: string | null
          subscription_status: string | null
          timezone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          academic_year?: string | null
          address?: string | null
          city?: string | null
          code: string
          created_at?: string | null
          currency?: string | null
          domain?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_staff?: number | null
          max_students?: number | null
          name: string
          phone?: string | null
          primary_color?: string | null
          principal_name?: string | null
          secondary_color?: string | null
          subscription_end?: string | null
          subscription_plan?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          academic_year?: string | null
          address?: string | null
          city?: string | null
          code?: string
          created_at?: string | null
          currency?: string | null
          domain?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_staff?: number | null
          max_students?: number | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          principal_name?: string | null
          secondary_color?: string | null
          subscription_end?: string | null
          subscription_plan?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      student_fees: {
        Row: {
          assigned_amount: number
          created_at: string | null
          discount_amount: number | null
          discount_percent: number | null
          discount_reason: string | null
          fee_structure_id: string | null
          final_amount: number
          id: string
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_amount: number
          created_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          discount_reason?: string | null
          fee_structure_id?: string | null
          final_amount: number
          id?: string
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_amount?: number
          created_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          discount_reason?: string | null
          fee_structure_id?: string | null
          final_amount?: number
          id?: string
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_no: string | null
          blood_group: string | null
          class_id: string | null
          cnic_bform: string | null
          created_at: string | null
          date_of_birth: string | null
          father_name: string | null
          fee_category: string | null
          gender: string | null
          id: string
          parent_id: string | null
        }
        Insert: {
          address?: string | null
          admission_no?: string | null
          blood_group?: string | null
          class_id?: string | null
          cnic_bform?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          father_name?: string | null
          fee_category?: string | null
          gender?: string | null
          id: string
          parent_id?: string | null
        }
        Update: {
          address?: string | null
          admission_no?: string | null
          blood_group?: string | null
          class_id?: string | null
          cnic_bform?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          father_name?: string | null
          fee_category?: string | null
          gender?: string | null
          id?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_classes: {
        Row: {
          class_id: string | null
          created_at: string | null
          id: string
          subject: string | null
          teacher_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          id?: string
          subject?: string | null
          teacher_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          id?: string
          subject?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string | null
          department: string | null
          designation: string | null
          id: string
          joining_date: string | null
          qualification: string | null
          salary: number | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          designation?: string | null
          id: string
          joining_date?: string | null
          qualification?: string | null
          salary?: number | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          designation?: string | null
          id?: string
          joining_date?: string | null
          qualification?: string | null
          salary?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable: {
        Row: {
          class_id: string
          created_at: string | null
          day_of_week: number | null
          end_time: string | null
          id: string
          period_number: number | null
          start_time: string | null
          subject: string
          teacher_id: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          period_number?: number | null
          start_time?: string | null
          subject: string
          teacher_id?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          period_number?: number | null
          start_time?: string | null
          subject?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          check_in: string
          check_out: string | null
          created_at: string | null
          id: string
          id_number: string | null
          id_type: string | null
          notes: string | null
          phone: string | null
          purpose: string
          visitor_name: string
          whom_to_meet: string | null
        }
        Insert: {
          check_in?: string
          check_out?: string | null
          created_at?: string | null
          id?: string
          id_number?: string | null
          id_type?: string | null
          notes?: string | null
          phone?: string | null
          purpose: string
          visitor_name: string
          whom_to_meet?: string | null
        }
        Update: {
          check_in?: string
          check_out?: string | null
          created_at?: string | null
          id?: string
          id_number?: string | null
          id_type?: string | null
          notes?: string | null
          phone?: string | null
          purpose?: string
          visitor_name?: string
          whom_to_meet?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_school_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student" | "parent" | "super_admin"
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
  public: {
    Enums: {
      app_role: ["admin", "teacher", "student", "parent", "super_admin"],
    },
  },
} as const
