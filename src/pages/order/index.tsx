import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import StatusTag from '@/components/StatusTag'
import { orderList } from '@/data/order'
import styles from './index.module.scss'

const STATUS_FILTERS = ['全部', '待确认', '制作中', '已烧成', '已完成']

const OrderPage = () => {
  const [activeStatus, setActiveStatus] = useState('全部')

  const filteredOrders = useMemo(() => {
    if (activeStatus === '全部') return orderList
    return orderList.filter(o => o.status === activeStatus)
  }, [activeStatus])

  return (
    <ScrollView className={styles.orderPage} scrollY>
      <ScrollView className={styles.filterRow} scrollX>
        {STATUS_FILTERS.map(status => (
          <View
            key={status}
            className={classnames(styles.filterBtn, activeStatus === status && styles.filterBtnActive)}
            onClick={() => setActiveStatus(status)}
          >
            <Text>{status}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.content}>
        <SectionHeader title="定制订单" subtitle={`共${filteredOrders.length}单`} />
        {filteredOrders.map(order => (
          <View key={order.id} className={styles.orderCard}>
            <View className={styles.orderHeader}>
              <Text className={styles.orderWorkName}>{order.workName}</Text>
              <StatusTag status={order.status} type="order" />
            </View>
            <View className={styles.orderBody}>
              <View className={styles.orderRow}>
                <Text className={styles.orderLabel}>客户</Text>
                <Text className={styles.orderValue}>{order.clientName} {order.phone}</Text>
              </View>
              <View className={styles.orderRow}>
                <Text className={styles.orderLabel}>下单日期</Text>
                <Text className={styles.orderValue}>{order.createTime}</Text>
              </View>
              {order.notes && (
                <View className={styles.orderRow}>
                  <Text className={styles.orderLabel}>备注</Text>
                  <Text className={styles.orderValue}>{order.notes}</Text>
                </View>
              )}
            </View>
            <View className={styles.engravingSection}>
              <Text className={styles.engravingLabel}>刻绘要求</Text>
              <Text className={styles.engravingText}>{order.engravingReq}</Text>
            </View>
            <View className={styles.orderFooter}>
              <Text className={styles.orderPrice}>
                <Text className={styles.orderPriceUnit}>¥</Text>
                {order.price.toLocaleString()}
              </Text>
              <Text className={styles.orderDeadline}>截止：{order.deadline}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

export default OrderPage
