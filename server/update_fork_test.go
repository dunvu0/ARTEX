package server

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestForkUpdatesDisabled(t *testing.T) {
	// A zero-value server has no manager or update network configuration. These
	// handlers must return before using either or starting background work.
	s := &Server{}
	for _, force := range []string{"", "?force=1"} {
		w := httptest.NewRecorder()
		s.updateCheck(w, httptest.NewRequest(http.MethodGet, "/api/update/check"+force, nil))
		var response struct {
			Disabled  bool `json:"disabled"`
			HasUpdate bool `json:"has_update"`
		}
		if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
			t.Fatal(err)
		}
		if w.Code != http.StatusOK || !response.Disabled || response.HasUpdate {
			t.Fatalf("unexpected check response: %d %s", w.Code, w.Body.String())
		}
	}
	for name, handler := range map[string]http.HandlerFunc{
		"apply": s.updateApply, "rollback": s.updateRollback,
	} {
		t.Run(name, func(t *testing.T) {
			w := httptest.NewRecorder()
			handler(w, httptest.NewRequest(http.MethodPost, "/api/update/"+name, nil))
			if w.Code != http.StatusForbidden {
				t.Fatalf("expected disabled action, got %d", w.Code)
			}
		})
	}
}
