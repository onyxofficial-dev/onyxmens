import { createAdminClient } from './supabase/admin'

export async function checkRateLimit(
  ip: string,
  route: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; count: number; resetTime: number }> {
  const supabase = createAdminClient()
  const now = new Date()
  const windowMs = windowSeconds * 1000

  // 1. Fetch current rate limit record for this IP and route
  const { data, error } = await supabase
    .from('rate_limits')
    .select('count, reset_time')
    .eq('ip', ip)
    .eq('route', route)
    .maybeSingle()

  if (error) {
    console.error(`Rate limit DB fetch error:`, error)
    // Fail-open or fail-closed based on safety. Let's fail-open (allow) so DB hiccups don't block users.
    return { success: true, count: 1, resetTime: now.getTime() + windowMs }
  }

  // 2. If no record exists, insert a new one
  if (!data) {
    const resetTime = new Date(now.getTime() + windowMs)
    const { error: insertError } = await supabase
      .from('rate_limits')
      .insert({
        ip,
        route,
        count: 1,
        reset_time: resetTime.toISOString()
      })

    if (insertError) {
      console.error('Rate limit DB insert error:', insertError)
    }

    return { success: true, count: 1, resetTime: resetTime.getTime() }
  }

  const resetTime = new Date(data.reset_time)

  // 3. If window has expired, reset count and update reset_time
  if (now > resetTime) {
    const newResetTime = new Date(now.getTime() + windowMs)
    const { error: updateError } = await supabase
      .from('rate_limits')
      .update({
        count: 1,
        reset_time: newResetTime.toISOString()
      })
      .eq('ip', ip)
      .eq('route', route)

    if (updateError) {
      console.error('Rate limit DB update error (reset):', updateError)
    }

    return { success: true, count: 1, resetTime: newResetTime.getTime() }
  }

  // 4. If count has exceeded limit, reject
  if (data.count >= limit) {
    return { success: false, count: data.count, resetTime: resetTime.getTime() }
  }

  // 5. Increment count otherwise
  const newCount = data.count + 1
  const { error: incrementError } = await supabase
    .from('rate_limits')
    .update({
      count: newCount
    })
    .eq('ip', ip)
    .eq('route', route)

  if (incrementError) {
    console.error('Rate limit DB update error (increment):', incrementError)
  }

  return { success: true, count: newCount, resetTime: resetTime.getTime() }
}
