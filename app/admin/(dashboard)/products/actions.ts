'use server'

import { createClient, validateRole } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { insertAuditLog } from '@/lib/audit'

export async function checkSlugUniqueness(slug: string, productId?: string) {
  const supabase = await createClient()
  let query = supabase.from('products').select('id').eq('slug', slug)
  if (productId) {
    query = query.neq('id', productId)
  }
  const { data, error } = await query
  if (error) {
    throw new Error(`Database error checking slug: ${error.message}`)
  }
  if (!data) return false
  return data.length === 0
}

export async function uploadProductImage(formData: FormData) {
  try {
    await validateRole()

    const file = formData.get('file') as File
    const productId = formData.get('productId') as string
    if (!file || !productId) {
      throw new Error('File and Product ID are required')
    }

    console.log('[uploadProductImage] File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      hasArrayBuffer: typeof file.arrayBuffer === 'function'
    })

    const supabase = createAdminClient()
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const storagePath = `products/${productId}/${fileName}`

    let buffer: Buffer
    if (typeof file.arrayBuffer === 'function') {
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } else {
      console.warn('[uploadProductImage] file.arrayBuffer is not a function. Falling back to stream reading.')
      const chunks: any[] = []
      const stream = (file as any).stream()
      for await (const chunk of stream) {
        chunks.push(chunk)
      }
      buffer = Buffer.concat(chunks)
    }

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/jpeg',
        duplex: 'half'
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath)

    return { publicUrl }
  } catch (error: any) {
    console.error('[uploadProductImage] Server Action error:', error)
    throw new Error(error.message || 'Image upload failed on server.')
  }
}

export async function getProductForEdit(id: string) {
  const supabase = await createClient()
  
  const { data: product, error: prodError } = await supabase
    .from('products')
    .select(`
      *,
      product_images (*),
      product_variants (*)
    `)
    .eq('id', id)
    .single()
    
  if (prodError || !product) {
    return null
  }
  
  return product
}

export async function saveProduct(
  productData: {
    id: string
    name: string
    slug: string
    category: string
    description: string
    fabric_details: string
    fit_notes: string
    fit: string | null
    design_tags: string[]
    care_instructions: string
    base_price: number
    intent_tags: string[]
    is_featured: boolean
    is_live: boolean
    is_active: boolean
  },
  variants: Array<{
    id?: string
    size: string
    color: string
    color_hex: string
    stock_quantity: number
  }>,
  images: Array<{
    id?: string
    image_url: string
    sort_order: number
    is_cover: boolean
  }>,
  removedVariantIds: string[],
  removedImageIds: string[]
) {
  await validateRole()
  const supabase = createAdminClient()

  // 1. Check slug uniqueness
  const isUnique = await checkSlugUniqueness(productData.slug, productData.id)
  if (!isUnique) {
    throw new Error('Slug must be unique. Choose a different name or edit the slug.')
  }

  // Fetch old product for audit log
  const { data: oldProduct } = await supabase
    .from('products')
    .select('name, is_live')
    .eq('id', productData.id)
    .single()

  // 2. Insert or Upsert Product
  const { error: prodError } = await supabase
    .from('products')
    .upsert({
      id: productData.id,
      name: productData.name,
      slug: productData.slug,
      category: productData.category,
      description: productData.description,
      fabric_details: productData.fabric_details || null,
      fit_notes: productData.fit_notes || null,
      fit: productData.fit || null,
      design_tags: productData.design_tags || [],
      care_instructions: productData.care_instructions || null,
      base_price: productData.base_price,
      intent_tags: productData.intent_tags,
      is_featured: productData.is_featured,
      is_live: productData.is_live,
      is_active: productData.is_active,
    })

  if (prodError) {
    throw new Error(`Failed to save product: ${prodError.message}`)
  }

  // 3. Handle Variant Deletions
  for (const varId of removedVariantIds) {
    // Check if variant has order items referencing it
    const { data: orderedItems, error: orderCheckErr } = await supabase
      .from('order_items')
      .select('id')
      .eq('variant_id', varId)
      .limit(1)

    if (orderCheckErr) {
      throw new Error(`Failed to check order history for variant ${varId}`)
    }

    if (orderedItems && orderedItems.length > 0) {
      // Hard delete blocked by references: soft disable it
      const { error: softDisableErr } = await supabase
        .from('product_variants')
        .update({
          stock_quantity: 0,
          is_out_of_stock: true
        })
        .eq('id', varId)

      if (softDisableErr) {
        throw new Error(`Failed to soft-disable variant ${varId}: ${softDisableErr.message}`)
      }
    } else {
      // Safe to hard delete
      const { error: deleteErr } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', varId)

      if (deleteErr) {
        throw new Error(`Failed to delete variant ${varId}: ${deleteErr.message}`)
      }
    }
  }

  // 4. Upsert Variants
  for (const variant of variants) {
    const isOutOfStock = variant.stock_quantity <= 0
    const variantPayload = {
      product_id: productData.id,
      size: variant.size,
      color: variant.color,
      color_hex: variant.color_hex,
      stock_quantity: variant.stock_quantity,
      is_out_of_stock: isOutOfStock
    }

    let varError;
    if (variant.id) {
      const { error } = await supabase
        .from('product_variants')
        .update(variantPayload)
        .eq('id', variant.id)
      varError = error
    } else {
      const { error } = await supabase
        .from('product_variants')
        .insert(variantPayload)
      varError = error
    }

    if (varError) {
      throw new Error(`Failed to save variant: ${varError.message}`)
    }
  }

  // 5. Handle Image Deletions
  for (const imgId of removedImageIds) {
    // Fetch image url to delete from storage
    const { data: imgData } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('id', imgId)
      .single()

    if (imgData) {
      // Remove from DB
      await supabase.from('product_images').delete().eq('id', imgId)
      
      // Extract storage path from public URL
      // Format: http://.../storage/v1/object/public/product-images/products/productId/filename
      const urlParts = imgData.image_url.split('/product-images/')
      if (urlParts.length > 1) {
        const storagePath = urlParts[1]
        await supabase.storage.from('product-images').remove([storagePath])
      }
    }
  }

  // 6. Upsert Images
  for (const img of images) {
    const imgPayload = {
      product_id: productData.id,
      image_url: img.image_url,
      sort_order: img.sort_order,
      is_cover: img.is_cover
    }

    let imgError;
    if (img.id) {
      const { error } = await supabase
        .from('product_images')
        .update(imgPayload)
        .eq('id', img.id)
      imgError = error
    } else {
      const { error } = await supabase
        .from('product_images')
        .insert(imgPayload)
      imgError = error
    }

    if (imgError) {
      throw new Error(`Failed to save image: ${imgError.message}`)
    }
  }

  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email || 'ADMIN'

  if (oldProduct) {
    await insertAuditLog({
      action_type: 'product_edited',
      actor_email: email,
      entity_type: 'product',
      entity_id: productData.id,
      entity_label: productData.name,
      old_value: { name: oldProduct.name, is_live: oldProduct.is_live },
      new_value: { name: productData.name, is_live: productData.is_live }
    })
  } else {
    await insertAuditLog({
      action_type: 'product_created',
      actor_email: email,
      entity_type: 'product',
      entity_id: productData.id,
      entity_label: productData.name,
    })
  }

  // Revalidate public catalog pages and inventory
  revalidatePath('/admin/products')
  revalidatePath('/admin/inventory')
  revalidatePath('/shop')
  revalidatePath('/shop/t-shirts')
  revalidatePath('/shop/shirts')
  revalidatePath('/shop/jeans')
  revalidatePath('/shop/outerwear')
  revalidatePath('/new-drops')
  revalidatePath('/search')
  revalidatePath(`/products/${productData.slug}`)
  revalidatePath('/')
  
  return { success: true }
}

export async function archiveProductAction(id: string) {
  await validateRole()
  const supabase = createAdminClient()
  
  const { data: oldProduct } = await supabase.from('products').select('name').eq('id', id).single()

  const { error } = await supabase
    .from('products')
    .update({ is_active: false, is_live: false })
    .eq('id', id)
    
  if (error) {
    throw new Error(`Failed to archive product: ${error.message}`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email || 'ADMIN'

  await insertAuditLog({
    action_type: 'product_archived',
    actor_email: email,
    entity_type: 'product',
    entity_id: id,
    entity_label: oldProduct?.name || id,
  })
  
  revalidatePath('/admin/products')
  revalidatePath('/admin/inventory')
  revalidatePath('/shop')
  revalidatePath('/shop/t-shirts')
  revalidatePath('/shop/shirts')
  revalidatePath('/shop/jeans')
  revalidatePath('/shop/outerwear')
  revalidatePath('/new-drops')
  revalidatePath('/')
  return { success: true }
}

export async function deleteProductAction(id: string) {
  const { user } = await validateRole()
  const email = user?.email || 'ADMIN'
  const supabase = createAdminClient()

  // 1. Check if the product has associated order items
  const { count, error: countError } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', id)

  if (countError) {
    throw new Error(`Failed to check product usage in orders: ${countError.message}`)
  }

  if (count && count > 0) {
    throw new Error("This product cannot be deleted permanently because it has already been ordered by customers. You can archive it instead to remove it from the shop.")
  }

  // 2. Fetch product name, slug, and image URLs to delete files
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('name, slug, product_images(image_url)')
    .eq('id', id)
    .single()

  if (fetchError || !product) {
    throw new Error("Failed to fetch product details or product does not exist.")
  }

  // 3. Delete files from storage
  const images = product.product_images || []
  for (const img of images) {
    const urlParts = img.image_url.split('/product-images/')
    if (urlParts.length > 1) {
      const storagePath = urlParts[1]
      await supabase.storage.from('product-images').remove([storagePath])
    }
  }

  // 4. Delete the product row (children: variants, images, reviews will CASCADE delete)
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (deleteError) {
    throw new Error(`Failed to delete product from database: ${deleteError.message}`)
  }

  // 5. Log audit trail
  await insertAuditLog({
    action_type: 'product_deleted',
    actor_email: email,
    entity_type: 'product',
    entity_id: id,
    entity_label: product.name,
  })

  // 6. Revalidate cache
  revalidatePath('/admin/products')
  revalidatePath('/admin/inventory')
  revalidatePath('/shop')
  revalidatePath('/shop/t-shirts')
  revalidatePath('/shop/shirts')
  revalidatePath('/shop/jeans')
  revalidatePath('/shop/outerwear')
  revalidatePath('/new-drops')
  revalidatePath(`/products/${product.slug}`)
  revalidatePath('/')

  return { success: true }
}

