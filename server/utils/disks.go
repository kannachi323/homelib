package utils

import (
	"bytes"
	"os/exec"
	"strings"
)

func GetVolumeName(mountPoint string) (string, error) {
	cmd := exec.Command("diskutil", "info", mountPoint)
	var out bytes.Buffer
	cmd.Stdout = &out
	if err := cmd.Run(); err != nil {
		return "", err
	}

	lines := strings.Split(out.String(), "\n")
	for _, line := range lines {
		if strings.Contains(line, "Volume Name:") {
			parts := strings.SplitN(line, ":", 2)
			if len(parts) == 2 {
				return strings.TrimSpace(parts[1]), nil
			}
		}
	}

	return "", nil // no volume name found
}