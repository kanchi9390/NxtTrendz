import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {Link} from 'react-router-dom'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'
import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'
import './index.css'

const statusConstants = {
  initial: 'INITIAL',
  loading: 'LOADING',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class ProductItemDetails extends Component {
  state = {
    productDetails: {},
    productCount: 1,
    apiStatus: statusConstants.initial,
  }

  componentDidMount() {
    this.getProductsDetails()
  }

  getUpdatedProductDetails = data => {
    const updatedProductsDetails = {
      availability: data.availability,
      brand: data.brand,
      description: data.description,
      id: data.id,
      imageUrl: data.image_url,
      price: data.price,
      rating: data.rating,
      style: data.style,
      title: data.title,
      totalReviews: data.total_reviews,
    }
    return updatedProductsDetails
  }

  onIncreaseCount = () => {
    this.setState(prev => ({productCount: prev.productCount + 1}))
  }

  onDecreaseCount = () => {
    const {productCount} = this.state
    if (productCount > 1) {
      this.setState(prev => ({productCount: prev.productCount - 1}))
    }
  }

  getProductsDetails = async () => {
    this.setState({apiStatus: statusConstants.loading})
    const {match} = this.props
    const {params} = match
    const {id} = params
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }

    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const data = await response.json()
      const updatedProductDetails = {
        ...this.getUpdatedProductDetails(data),
        similarProducts: data.similar_products.map(each =>
          this.getUpdatedProductDetails(each),
        ),
      }
      console.log(updatedProductDetails)
      this.setState({
        productDetails: updatedProductDetails,
        apiStatus: statusConstants.success,
      })
    }
    if (response.status === 404) {
      this.setState({apiStatus: statusConstants.failure})
    }
  }

  renderLoadingView = () => (
    <div className="products-loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderProductItemDetails = () => {
    const {productDetails, productCount} = this.state
    const {
      imageUrl,
      title,
      price,
      rating,
      totalReviews,
      description,
      availability,
      brand,
      similarProducts,
    } = productDetails
    return (
      <div className="product-item-details-container">
        <div className="product-item-container">
          <img src={imageUrl} alt="product" className="product-item-image" />
          <div className="product-info">
            <h1 className="product-item-title">{title}</h1>
            <p className="product-item-price">Rs {price}/- </p>
            <div className="product-item-rating-container">
              <button type="button" className="product-item-rating-btn">
                <p className="product-item-rating">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                  className="product-item-star"
                />
              </button>
              <p className="product-item-reviews">{totalReviews} Reviews</p>
            </div>
            <p className="product-item-description">{description}</p>
            <p className="product-item-p">
              <span className="product-item-span">Available: </span>
              {availability}
            </p>
            <p className="product-item-p">
              <span className="product-item-span">Brand: </span>
              {brand}
            </p>
            <hr className="break-line" />
            <div className="product-item-count-container">
              <button
                type="button"
                className="count-btn"
                onClick={this.onDecreaseCount}
                data-testid="minus"
              >
                <BsDashSquare />
              </button>
              <p className="product-item-count">{productCount}</p>
              <button
                type="button"
                className="count-btn"
                onClick={this.onIncreaseCount}
                data-testid="plus"
              >
                <BsPlusSquare />
              </button>
            </div>
            <button type="button" className="add-cart-btn">
              ADD TO CART
            </button>
          </div>
        </div>
        <div className="similar-products-container">
          <h1 className="similar-products-h">Similar Products</h1>
          <ul className="similar-products-list">
            {similarProducts.map(eachItem => (
              <SimilarProductItem
                productItemDetails={eachItem}
                key={eachItem.id}
              />
            ))}
          </ul>
        </div>
      </div>
    )
  }

  renderProductItemFailure = () => (
    <div className="products-item-not-found-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="error view"
        className="products-item-not-found-img"
      />
      <h1 className="products-item-not-found-heading-text">
        Product Not Found
      </h1>
      <Link to="/products">
        <button type="button" className="products-item-not-found-btn">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  getSwitch = () => {
    const {apiStatus} = this.state
    console.log(apiStatus)
    switch (apiStatus) {
      case statusConstants.loading:
        return this.renderLoadingView()
      case statusConstants.success:
        return this.renderProductItemDetails()
      case statusConstants.failure:
        return this.renderProductItemFailure()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        {this.getSwitch()}
      </>
    )
  }
}

export default ProductItemDetails
