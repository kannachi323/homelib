package core

import (
	"time"
)


type Device struct {
	ID string `json:"id"`
	Name string `json:"name"`
	DeviceType string `json:"device_type"`
	OwnerID string `json:"owner_id"`
	IsCloud bool `json:"is_cloud"`
	LastSync time.Time `json:"last_sync"`
}


func NewDevice(id, name, deviceType string, isCloud bool, status int) *Device {
	return &Device{
		ID: id,
		Name: name,
		DeviceType: deviceType,
		IsCloud: isCloud,
		LastSync: time.Now(),
	}
}

func (d *Device) SyncNow() {
	d.LastSync = time.Now()
}

