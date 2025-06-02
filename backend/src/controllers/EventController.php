<?php
// backend/src/controllers/EventController.php
require_once __DIR__ . '/../models/EventModel.php';

class EventController {
    private $model;

    public function __construct($db) {
        $this->model = new EventModel($db);
    }

    public function getEvents() {
        try {
            return $this->model->getAllEvents();
        } catch (Exception $e) {
            error_log("Error getting events: " . $e->getMessage());
            return [];
        }
    }

    public function getEventsByUserId(int $userId) {
        try {
            return $this->model->getEventsByUserId($userId);
        } catch (Exception $e) {
            error_log("Error getting events for user ID $userId: " . $e->getMessage());
            return [];
        }
    }

    public function getEventById(int $id) {
        try {
            $event = $this->model->getEventById($id);
            if (!$event) {
                error_log("Event not found for ID: $id");
                return null;
            }
            return $event;
        } catch (Exception $e) {
            error_log("Error getting event ID $id: " . $e->getMessage());
            throw $e;
        }
    }

    public function addEvent($data) {
        try {
            error_log("EventController::addEvent received data: " . json_encode($data));

            $required = ['user_id', 'title', 'type_id', 'date', 'location', 'expected_guests'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
                    throw new Exception("Field '$field' is required");
                }
            }

            $data['description'] = $data['description'] ?? '';
            $data['image_banniere'] = $data['image_banniere'] ?? '';
            $data['budget'] = $data['budget'] ?? 0;
            $data['status'] = $data['status'] ?? 'Planned';
            $data['expected_guests'] = (int)$data['expected_guests'];

            if (!is_numeric($data['user_id'])) {
                throw new Exception('user_id must be numeric');
            }
            if (!is_numeric($data['type_id'])) {
                throw new Exception('type_id must be numeric');
            }
            if (!is_numeric($data['expected_guests'])) {
                throw new Exception('expected_guests must be numeric');
            }
            if (isset($data['budget']) && !is_numeric($data['budget'])) {
                throw new Exception('budget must be numeric');
            }

            if (isset($data['requetes']) && is_array($data['requetes'])) {
                foreach ($data['requetes'] as $requete) {
                    if (!isset($requete['titre']) || empty(trim($requete['titre']))) {
                        throw new Exception("Requete title is required");
                    }
                    if (!isset($requete['montant']) || !is_numeric($requete['montant']) || $requete['montant'] <= 0) {
                        throw new Exception("Requete amount must be a positive number");
                    }
                    if (isset($requete['vendor_id']) && !is_numeric($requete['vendor_id'])) {
                        throw new Exception("Requete vendor_id must be numeric");
                    }
                }
            }

            $eventId = $this->model->createEvent($data);

            if (!$eventId) {
                throw new Exception('Failed to create event - no ID returned');
            }

            error_log("Event created successfully with ID: $eventId");
            return $eventId;
        } catch (Exception $e) {
            error_log("Error adding event: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    public function updateEvent($data) {
        try {
            error_log("EventController::updateEvent received data: " . json_encode($data));

            if (!isset($data['id']) || !is_numeric($data['id'])) {
                throw new Exception("Event ID is required and must be numeric");
            }

            // Check if this is a status-only update
            if (array_keys($data) === ['id', 'status']) {
                if (!isset($data['status']) || empty(trim($data['status']))) {
                    throw new Exception("Status is required for status-only update");
                }
                if (!in_array($data['status'], ['Planned', 'Ongoing', 'Completed', 'Cancelled'])) {
                    throw new Exception("Invalid status value");
                }

                $this->model->updateEventStatus((int)$data['id'], $data['status']);
                error_log("Event status updated successfully with ID: " . $data['id']);
                return;
            }

            // Full update logic
            $existingEvent = $this->model->getEventById((int)$data['id']);
            if (!$existingEvent) {
                throw new Exception("Event not found");
            }

            $updateData = array_merge($existingEvent, $data);
            $updateData['image_banniere'] = $data['image_banniere'] ?? $existingEvent['bannerImage'] ?? null;
            $updateData['status'] = in_array($data['status'] ?? $existingEvent['status'], ['Planned', 'Ongoing', 'Completed', 'Cancelled'])
                ? ($data['status'] ?? $existingEvent['status'])
                : 'Planned';

            if (isset($data['requetes']) && is_array($data['requetes'])) {
                foreach ($data['requetes'] as $requete) {
                    if (!isset($requete['id_requete']) || !is_numeric($requete['id_requete'])) {
                        throw new Exception("Requete ID is required and must be numeric");
                    }
                    if (!isset($requete['titre']) || empty(trim($requete['titre']))) {
                        throw new Exception("Requete title is required");
                    }
                    if (isset($requete['vendor_id']) && !is_numeric($requete['vendor_id'])) {
                        throw new Exception("Requete vendor_id must be numeric");
                    }
                }
            }

            $this->model->updateEvent($updateData);
            error_log("Event updated successfully with ID: " . $data['id']);
        } catch (Exception $e) {
            error_log("Error updating event: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    public function deleteEvent(int $id) {
        try {
            $existingEvent = $this->model->getEventById($id);
            if (!$existingEvent) {
                throw new Exception("Event not found");
            }

            $this->model->deleteEvent($id);
            error_log("Event deleted successfully with ID: $id");
        } catch (Exception $e) {
            error_log("Error deleting event ID $id: " . $e->getMessage());
            throw $e;
        }
    }
}
?>