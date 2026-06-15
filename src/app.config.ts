export default defineAppConfig({
  pages: [
    'pages/clay/index',
    'pages/process/index',
    'pages/works/index',
    'pages/mine/index',
    'pages/design/index',
    'pages/firing/index',
    'pages/order/index',
    'pages/trace/index',
    'pages/clayDetail/index',
    'pages/workDetail/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#F7F2ED',
    navigationBarTitleText: '紫砂工坊',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#9B8B7A',
    selectedColor: '#8B6F4E',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/clay/index',
        text: '泥料'
      },
      {
        pagePath: 'pages/process/index',
        text: '制壶'
      },
      {
        pagePath: 'pages/works/index',
        text: '作品'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
