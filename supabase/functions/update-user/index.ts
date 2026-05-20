import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Check if the user is an admin
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData.role !== 'admin') {
      throw new Error('Unauthorized: Admin role required')
    }

    const { userId, email, password, name, role, department } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Update user with Service Role Key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const updateData: any = {}
    if (email) updateData.email = email
    if (password) updateData.password = password
    if (name) updateData.user_metadata = { ...updateData.user_metadata, name }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        updateData
      )
      if (updateError) throw updateError
    }

    // Update user_roles if role is provided
    if (role) {
      const { error: roleUpdateError } = await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: userId, role })
      
      if (roleUpdateError) throw roleUpdateError
    }

    // Update agents table
    const agentUpdate: any = {}
    if (name) agentUpdate.name = name
    if (email) agentUpdate.email = email
    if (role) agentUpdate.role = role
    if (department) agentUpdate.department = department

    if (Object.keys(agentUpdate).length > 0) {
      const { error: agentUpdateError } = await supabaseAdmin
        .from('agents')
        .update(agentUpdate)
        .eq('user_id', userId)

      if (agentUpdateError) throw agentUpdateError
    }

    return new Response(
      JSON.stringify({ message: 'User updated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
