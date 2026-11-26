package com.picklepass.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class CreateCourtRequest {
    @NotBlank(message = "Court name is required.")
    private String name;

    @NotBlank(message = "Location is required.")
    private String location;

    @Min(value = 2, message = "Minimum 2 players per match.")
    @Max(value = 4, message = "Maximum 4 players per match.")
    private Integer playersPerMatch = 4;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getPlayersPerMatch() { return playersPerMatch; }
    public void setPlayersPerMatch(Integer playersPerMatch) { this.playersPerMatch = playersPerMatch; }
}