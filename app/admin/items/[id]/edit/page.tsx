import { updateProductAction, updateProductImageAction } from '@/utils/actions/admin'
import { fetchAdminProductDetails } from '@/utils/actions/admin'
import FormContainer from '@/components/form/FormContainer'
import FormInput from '@/components/form/FormInput'
import PriceInput from '@/components/form/PriceInput'
import TextAreaInput from '@/components/form/TextAreaInput'
import { SubmitButton } from '@/components/form/Buttons'
import CheckboxInput from '@/components/form/CheckboxInput'
import ImageInputContainer from '@/components/form/ImageInputContainer'

async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  {
    const product = await fetchAdminProductDetails(id)
    const { name, company, description, featured, price } = product
    return (
      <section>
        <h1 className="text-4xl font-semibold mb-8 capitalize">update product</h1>
        <div className="border p-8 rounded">
          <ImageInputContainer
            action={updateProductImageAction}
            name={name}
            image={product.image}
            text={'Update Image'}
          >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="url" value={product.image} />
          </ImageInputContainer>
          <FormContainer action={updateProductAction}>
            <div className="grid gap-4 md:grid-cols-2 my-4">
              <input type="hidden" name="id" value={id} />
              <FormInput type="text" name="name" label="product name" defaultValue={name} />
              <FormInput type="text" name="company" defaultValue={company} />
              <PriceInput defaultValue={price} />
            </div>
            <TextAreaInput
              name="description"
              labelText="product description"
              defaultValue={description}
            />
            <div className="mt-6">
              <CheckboxInput name="featured" defaultChecked={featured} label="featured" />
            </div>
            <SubmitButton
              size="sm"
              text="update item"
              className="mt-8 text-2xl"
              loadingText="Updating Inventory Record..."
            />
          </FormContainer>
        </div>
      </section>
    )
  }
}
export default AdminEditProductPage
