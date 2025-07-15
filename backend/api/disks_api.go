package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/shirou/gopsutil/v4/disk"
)
type DiskInfo struct {
	Device      string  `json:"device"`
	Mountpoint  string  `json:"mountpoint"`
	Fstype      string  `json:"fstype"`
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"usedPercent"`
}

func ListDisks() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		partitions, err := disk.Partitions(true)
		if err != nil {
			http.Error(w, "Failed to get disk partitions", http.StatusInternalServerError)
			log.Printf("Error getting partitions: %v", err)
			return
		}

		var disks []DiskInfo

		for _, p := range partitions {
			usageStat, err := disk.Usage(p.Mountpoint)
			if err != nil {
				log.Printf("Could not get usage info for %s: %v", p.Mountpoint, err)
				continue
			}

			disks = append(disks, DiskInfo{
				Device:      p.Device,
				Mountpoint:  p.Mountpoint,
				Fstype:      p.Fstype,
				Total:       usageStat.Total,
				Used:        usageStat.Used,
				Free:        usageStat.Free,
				UsedPercent: usageStat.UsedPercent,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(disks); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			log.Printf("Error encoding JSON: %v", err)
			return
		}
	}
}