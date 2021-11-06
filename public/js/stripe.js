import axios from 'axios'
import { showAlert } from './alerts'

export const bookTour = async tourId => {
  const stripe = Stripe('pk_test_51JsipnJG16bolCBEmMSSSGBRN57QIKJZXSr3B8xe8x802ItdVC3G1XNV9WmgtKHoKFgWhPP3nv3Rfiuut3unBpca00XkKhOCOA')
  try {
    //1. get checkout session from API
    const session = await axios(`http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`)
    //2. create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    })
  } catch (err) {
    showAlert('error', err)
  }
}