export interface Slot {
    endTime: Date,
    startTime: Date,
    timeOfDay: 'morning' | 'afternoon' | 'evening',
    available: boolean
}
