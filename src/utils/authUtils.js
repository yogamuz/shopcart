// utils/authUtils.js
export const getRedirectPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'seller':
      return '/seller/dashboard'
    case 'user':
    default:
      return '/profile'
  }
}

export const getRoleDisplayName = (role) => {
  switch (role) {
    case 'admin':
      return 'Administrator'
    case 'seller':
      return 'Seller'
    case 'user':
      return 'User'
    default:
      return 'Unknown'
  }
}