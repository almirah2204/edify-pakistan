import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateStudentRequest {
  full_name: string;
  email?: string;
  phone?: string;
  class_id?: string | null;
  admission_no?: string;
  gender?: string;
  date_of_birth?: string | null;
  address?: string;
  blood_group?: string;
  father_name?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the requester is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create client with user token to verify admin role
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Only admins can create students' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body: CreateStudentRequest = await req.json();

    if (!body.full_name) {
      return new Response(JSON.stringify({ error: 'Full name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create admin client for privileged operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a unique email if not provided (required for auth user)
    const studentEmail = body.email || `student_${Date.now()}_${Math.random().toString(36).substring(7)}@placeholder.local`;
    
    // Generate a random password (student won't use password login initially)
    const randomPassword = crypto.randomUUID() + crypto.randomUUID();

    // Create auth user using admin API
    // The handle_new_user trigger will auto-create profile, user_role, and student records
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: studentEmail,
      password: randomPassword,
      email_confirm: true, // Auto-confirm since admin is creating
      user_metadata: {
        full_name: body.full_name,
        role: 'student',
      },
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const studentId = authData.user.id;

    // Update profile with additional info (trigger creates basic profile)
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name: body.full_name,
        email: body.email || null,
        phone: body.phone || null,
        is_approved: true,
      })
      .eq('id', studentId);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // Update student record with additional details (trigger creates basic student)
    const { error: studentError } = await adminClient
      .from('students')
      .update({
        class_id: body.class_id || null,
        admission_no: body.admission_no || null,
        gender: body.gender || null,
        date_of_birth: body.date_of_birth || null,
        address: body.address || null,
        blood_group: body.blood_group || null,
        father_name: body.father_name || null,
      })
      .eq('id', studentId);

    if (studentError) {
      console.error('Student record update error:', studentError);
      // Try to rollback by deleting the auth user
      await adminClient.auth.admin.deleteUser(studentId);
      return new Response(JSON.stringify({ error: studentError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        id: studentId,
        admission_no: body.admission_no,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
